import book, { OrderBook } from 'engine/orderBook';
import { IOrder, ITrade } from 'types';

export class Limit {
  constructor(public book: OrderBook) {}

  process = (order: IOrder): ITrade[] => {
    if (order.side === 'buy') {
      return this.processLimitBuy(order);
    } else if (order.side === 'sell') {
      return this.processLimitSell(order);
    }
    throw new Error('Side not recognized!');
  };

  private processLimitBuy = (order: IOrder): ITrade[] => {
    const trades: ITrade[] = [];
    const sellCount = this.book.sells.length;
    // Check that we have at least one matching order
    const hasAtLeastOneMatchingOrder =
      sellCount !== 0 && this.book.sells[sellCount - 1]!.price <= order.price;
    if (hasAtLeastOneMatchingOrder) {
      // Traverse all orders that match
      for (let i = sellCount - 1; i >= 0; i--) {
        const sellOrder = this.book.sells[i]!;
        if (sellOrder.price > order.price) {
          break;
        }
        // try to fill the full order
        if (sellOrder.amount >= order.amount) {
          trades.push({
            takerOrderId: order.id,
            makerOrderId: sellOrder.id,
            amount: order.amount,
            price: order.price,
          });
          sellOrder.amount -= order.amount;
          if (sellOrder.amount === 0) {
            this.book.removeSellOrder(i);
          }
          return trades;
        }
        // try to fill a partial order and continue
        if (sellOrder.amount < order.amount) {
          trades.push({
            takerOrderId: order.id,
            makerOrderId: sellOrder.id,
            amount: sellOrder.amount,
            price: sellOrder.price,
          });
          order.amount -= sellOrder.amount;
          this.book.removeSellOrder(i);
          continue;
        }
      }
    }
    this.book.add(order);
    return trades;
  };

  private processLimitSell = (order: IOrder): ITrade[] => {
    const trades: ITrade[] = [];
    const l = this.book.buys.length;
    // Check that we have at least one matching order
    const hasAtLeastOneMatchingOrder =
      l !== 0 && this.book.buys[l - 1]!.price >= order.price;
    if (hasAtLeastOneMatchingOrder) {
      for (let i = l - 1; i >= 0; i--) {
        const buyOrder = this.book.buys[i]!;
        if (buyOrder.price < order.price) {
          break;
        }
        // try to fill entire order
        if (buyOrder.amount >= order.amount) {
          trades.push({
            takerOrderId: order.id,
            makerOrderId: buyOrder.id,
            amount: order.amount,
            price: buyOrder.price,
          });
          buyOrder.amount -= order.amount;
          if (buyOrder.amount === 0) {
            this.book.removeBuyOrder(i);
          }
          return trades;
        }
        if (buyOrder.amount < order.amount) {
          trades.push({
            takerOrderId: order.id,
            makerOrderId: buyOrder.id,
            amount: buyOrder.amount,
            price: buyOrder.price,
          });
          order.amount -= buyOrder.amount;
          this.book.removeBuyOrder(i);
          continue;
        }
      }
    }
    this.book.add(order);
    return trades;
  };
}

export default new Limit(book);
