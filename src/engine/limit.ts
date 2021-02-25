import { OrderBook } from 'engine/orderBook';
import { Order, Trade } from 'types';

export class Limit {
  constructor(private book: OrderBook) {}

  processBuy = (order: Order): Trade[] => {
    const trades: Trade[] = [];
    const sellCount = this.book.sells.length;
    // Traverse all orders that match
    for (let i = sellCount - 1; i >= 0; i--) {
      const makerSellOrder = this.book.sells[i]!;
      if (makerSellOrder.price > order.price) {
        break;
      }
      // We always execute at the best price for the buyer
      const price = Math.min(makerSellOrder.price, order.price);
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

  processSell = (order: Order): Trade[] => {
    const trades: Trade[] = [];
    const l = this.book.buys.length;
    for (let i = l - 1; i >= 0; i--) {
      const makerBuyOrder = this.book.buys[i]!;
      if (makerBuyOrder.price < order.price) {
        break;
      }
      // We always execute at the best price for the buyer
      const price = Math.min(makerBuyOrder.price, order.price);
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
