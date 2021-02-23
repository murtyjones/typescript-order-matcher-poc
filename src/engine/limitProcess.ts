import book, { OrderBook } from 'engine/orderBook';
import { IOrder, ITrade } from 'types';

class Processor {
  constructor(private book: OrderBook) {}

  process = (order: IOrder): ITrade[] => {
    if (order.side === 'buy') {
      return this.processLimitBuy(order);
    } else if (order.side === 'sell') {
      return this.processLimitSell(order);
    }
    throw new Error('Side not recognized!');
  };

  // if there are sells and t
  processLimitBuy = (order: IOrder): ITrade[] => {
    const trades: ITrade[] = [];
    const sellCount = this.book.sells.length;
    // Check that we have at least one matching order
    const hasAtLeastOneMatchingOrder =
      sellCount !== 0 && this.book.sells[sellCount - 1]!.price < order.price;
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

  processLimitSell = (order: IOrder): ITrade[] => {
    const trades: ITrade[] = [];
    const l = this.book.sells.length;
    // Check that we have at least one matching order
    const hasAtLeastOneMatchingOrder =
      l !== 0 && this.book.sells[l - 1]!.price < order.price;
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
        }
      }
    }
    this.book.add(order);
    return trades;
  };
}

export default new Processor(book);
