import { IOrder } from 'types';

export interface IOrderBook {
  buys: IOrder[];
  sells: IOrder[];
}

export class OrderBook implements IOrderBook {
  public buys: IOrder[] = [];
  public sells: IOrder[] = [];

  // Adds a buy order to the list at the appropriate slot depending on its price
  addBuyOrder = (order: IOrder): void => {
    if (order.side !== 'buy') {
      throw new Error('Cannot add a sell order to the buy book');
    }
    const l = this.buys.length;
    let i = l - 1;
    for (; i >= 0; i -= 1) {
      const buyOrder = this.buys[i];
      if (buyOrder!.price < order.price) {
        break;
      }
    }
    if (i == l - 1) {
      // Put order at end of book
      this.buys.push(order);
    } else {
      // Otherwise, put order into array
      this.buys.splice(i, 0, order);
    }
  };

  addSellOrder = (order: IOrder): void => {
    if (order.side !== 'sell') {
      throw new Error('Cannot add a buy order to the sell book');
    }
    const l = this.sells.length;
    let i = l - 1;
    for (; i >= 0; i -= 1) {
      const sellOrder = this.sells[i];
      if (sellOrder!.price > order.price) {
        break;
      }
    }
    if (i == l - 1) {
      this.sells.push(order);
    } else {
      this.sells.splice(i, 0, order);
    }
  };

  removeBuyOrder = (index: number): void => {
    this.buys.splice(index, 1);
  };

  removeSellOrder = (index: number): void => {
    this.sells.splice(index, 1);
  };
}

export default new OrderBook();
