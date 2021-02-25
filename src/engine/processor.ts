import { Limit } from 'engine/limit';
import { Market } from 'engine/market';
import book, { OrderBook } from 'engine/orderBook';
import { Order, Trade } from 'types';

export class Processor {
  private limit: Limit;
  private market: Market;

  constructor(book: OrderBook) {
    this.limit = new Limit(book);
    this.market = new Market(book);
  }

  process = (order: Order): Trade[] => {
    if (order.type === 'limit') {
      return this.limit.process(order);
    } else if (order.type === 'market') {
      return this.market.process(order);
    }
    throw new Error('Order type not recognized!');
  };
}

export default new Processor(book);
