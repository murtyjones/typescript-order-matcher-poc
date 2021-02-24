import { Limit } from 'engine/limit';
import book, { OrderBook } from 'engine/orderBook';
import { Order, Trade } from 'types';

export class Processor {
  private limit: Limit;

  constructor(public book: OrderBook) {
    this.limit = new Limit(book);
  }

  process = (order: Order): Trade[] => {
    if (order.side === 'buy') {
      return this.limit.processBuy(order);
    } else if (order.side === 'sell') {
      return this.limit.processSell(order);
    }
    throw new Error('Side not recognized!');
  };
}

export default new Processor(book);
