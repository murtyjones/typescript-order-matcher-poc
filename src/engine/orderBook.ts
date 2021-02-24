import { Order } from 'types';

export interface IOrderBook {
  buys: Order[];
  sells: Order[];
}

export class OrderBook implements IOrderBook {
  public buys: Order[] = [];
  public sells: Order[] = [];

  add = (order: Order): void => {
    if (order.side === 'buy') {
      return this.addBuyOrder(order);
    } else if (order.side === 'sell') {
      return this.addSellOrder(order);
    }
    throw new Error('Unrecognized side');
  };

  // Adds a buy order to the list at the appropriate slot depending on its price
  private addBuyOrder = (order: Order): void => {
    const l = this.buys.length;
    let i = l - 1;
    for (; i >= 0; i -= 1) {
      const buyOrder = this.buys[i]!;
      if (buyOrder.price < order.price) {
        break;
      }
    }
    if (i == l - 1) {
      // Put order at end of book
      this.buys.push(order);
    } else {
      // Otherwise, put order into array
      this.buys.splice(i + 1, 0, order);
    }
  };

  private addSellOrder = (order: Order): void => {
    const l = this.sells.length;
    let i = l - 1;
    for (; i >= 0; i -= 1) {
      const sellOrder = this.sells[i]!;
      if (sellOrder.price > order.price) {
        break;
      }
    }
    if (i == l - 1) {
      this.sells.push(order);
    } else {
      this.sells.splice(i + 1, 0, order);
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
