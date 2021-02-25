import { OrderBook } from 'engine/orderBook';
import { MarketOrder, Order, Trade } from 'types';

export class Market {
  constructor(private book: OrderBook) {}

  process = (order: MarketOrder): Trade[] => {
    if (order.side === 'buy') {
      return this.processBuy(order);
    } else if (order.side === 'sell') {
      return this.processSell(order);
    }
    throw new Error('Order side not recognized!');
  };

  processBuy = (order: Order): Trade[] => {
    throw new Error('Unimplemented');
  };

  processSell = (order: Order): Trade[] => {
    throw new Error('Unimplemented');
  };
}
