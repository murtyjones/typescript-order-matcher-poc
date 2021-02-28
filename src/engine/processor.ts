import book, { OrderBook } from 'engine/orderBook';
import { Order, Trade } from 'types';
import { getMinPrice } from 'utils';

export class Processor {
  constructor(private book: OrderBook) {}

  getOrders = (side: 'buy' | 'sell'): Order[] =>
    side === 'buy' ? this.book.buys : this.book.sells;

  process = (order: Order): Trade[] => {
    if (order.side === 'buy') {
      return this.processBuy(order);
    } else if (order.side === 'sell') {
      return this.processSell(order);
    }
    throw new Error('Order side not recognized!');
  };

  private processBuy = (order: Order): Trade[] => {
    const trades: Trade[] = [];
    const sellCount = this.book.sells.length;
    // Traverse all orders that match
    for (let i = sellCount - 1; i >= 0; i--) {
      const makerSellOrder = this.book.sells[i]!;
      // If both orders are market orders, no agreement can be reached on price, so continue
      if (!('price' in makerSellOrder) && !('price' in order)) {
        continue;
      }
      // If no buyer is willing to pay seller's price, we're done
      if (
        'price' in makerSellOrder &&
        'price' in order &&
        makerSellOrder.price > order.price
      ) {
        break;
      }
      /**
       * We always execute at the best price for the buyer. If the maker is a
       * market order, take the buyers price because there's no liquidity otherwise.
       */
      const price = getMinPrice([makerSellOrder, order]);
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
    // If we didn't return early above, there's at least 1 share still to fill, so add the order to the book:
    this.book.add(order);
    return trades;
  };

  private processSell = (order: Order): Trade[] => {
    const trades: Trade[] = [];
    const l = this.book.buys.length;
    for (let i = l - 1; i >= 0; i--) {
      const makerBuyOrder = this.book.buys[i]!;
      // If both orders are market orders, no agreement can be reached on price, so continue
      if (!('price' in makerBuyOrder) && !('price' in order)) {
        continue;
      }
      // If no buyer is willing to pay seller's price, we're done
      if (
        'price' in makerBuyOrder &&
        'price' in order &&
        makerBuyOrder.price < order.price
      ) {
        break;
      }
      const price = getMinPrice([makerBuyOrder, order]);
      /**
       * We always execute at the best price for the buyer. If the maker is a
       * market order, take the seller's price because there's no liquidity otherwise.
       */
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
    // If we didn't return early above, there's at least 1 share still to fill, so add the order to the book:
    this.book.add(order);
    return trades;
  };
}

export default new Processor(book);
