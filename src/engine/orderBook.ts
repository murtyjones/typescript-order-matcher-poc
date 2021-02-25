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
    throw new Error('Order side not recognized!');
  };

  private addBuyOrder = (order: Order): void => {
    const l = this.buys.length;
    let i = l - 1;
    for (; i >= 0; i -= 1) {
      const buyOrder = this.buys[i]!;
      if (buyOrder.price < order.price) {
        break;
      }
    }
    this.buys.splice(i + 1, 0, order);
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
    this.sells.splice(i + 1, 0, order);
  };

  removeBuyOrder = (index: number): void => {
    this.buys.splice(index, 1);
  };

  removeSellOrder = (index: number): void => {
    this.sells.splice(index, 1);
  };
}

export default new OrderBook();
