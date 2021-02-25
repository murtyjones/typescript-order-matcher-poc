import { OrderBook } from 'engine/orderBook';
import { LimitOrder, Trade } from 'types';

export class Limit {
  constructor(public book: OrderBook) {}

  process = (order: LimitOrder): Trade[] => {
    if (order.side === 'buy') {
      return this.processBuy(order);
    } else if (order.side === 'sell') {
      return this.processSell(order);
    }
    throw new Error('Order side not recognized!');
  };

  private processBuy = (order: LimitOrder): Trade[] => {
    const trades: Trade[] = [];
    const sellCount = this.book.sells.length;
    // Traverse all orders that match
    for (let i = sellCount - 1; i >= 0; i--) {
      const makerSellOrder = this.book.sells[i]!;
      // If an agreement can no longer be found on price, exit
      if ('price' in makerSellOrder && makerSellOrder.price > order.price) {
        break;
      }
      /**
       * We always execute at the best price for the buyer. If the maker is a
       * market order, take the buyers price because there's no liquidity otherwise.
       */
      const price =
        'price' in makerSellOrder
          ? Math.min(makerSellOrder.price, order.price)
          : order.price;
      // try to fill the full order
      if (makerSellOrder.amount >= order.amount) {
        trades.push({
          takerOrderId: order.id,
          makerOrderId: makerSellOrder.id,
          amount: order.amount,
          price,
        });
        makerSellOrder.amount -= order.amount;
        if (makerSellOrder.amount === 0) {
          this.book.removeSellOrder(i);
        }
        return trades;
      }
      trades.push({
        takerOrderId: order.id,
        makerOrderId: makerSellOrder.id,
        amount: makerSellOrder.amount,
        price,
      });
      order.amount -= makerSellOrder.amount;
      this.book.removeSellOrder(i);
      continue;
    }
    this.book.add(order);
    return trades;
  };

  private processSell = (order: LimitOrder): Trade[] => {
    const trades: Trade[] = [];
    const l = this.book.buys.length;
    for (let i = l - 1; i >= 0; i--) {
      const makerBuyOrder = this.book.buys[i]!;
      if ('price' in makerBuyOrder && makerBuyOrder.price < order.price) {
        break;
      }
      /**
       * We always execute at the best price for the buyer. If the maker is a
       * market order, take the seller's price because there's no liquidity otherwise.
       */
      const price =
        'price' in makerBuyOrder
          ? Math.min(makerBuyOrder.price, order.price)
          : order.price;
      // try to fill entire order
      if (makerBuyOrder.amount >= order.amount) {
        trades.push({
          takerOrderId: order.id,
          makerOrderId: makerBuyOrder.id,
          amount: order.amount,
          price,
        });
        makerBuyOrder.amount -= order.amount;
        if (makerBuyOrder.amount === 0) {
          this.book.removeBuyOrder(i);
        }
        return trades;
      }
      trades.push({
        takerOrderId: order.id,
        makerOrderId: makerBuyOrder.id,
        amount: makerBuyOrder.amount,
        price,
      });
      order.amount -= makerBuyOrder.amount;
      this.book.removeBuyOrder(i);
      continue;
    }
    this.book.add(order);
    return trades;
  };
}
