import { OrderBook } from 'engine/orderBook';
import _ from 'lodash';
import { Order } from 'types';

describe('Order Book', () => {
  let book = new OrderBook();
  beforeEach(() => {
    book = new OrderBook();
  });
  it('should throw if invalid data passed', () => {
    const order = {} as Order;
    expect(() => book.add(order)).toThrowError('Order side not recognized!');
  });
  it('should add a limit order to an empty book', () => {
    const order: Order = {
      id: 1,
      amount: 100,
      price: 1.29,
      side: 'buy',
      type: 'limit',
    };
    expect(book.buys.length).toEqual(0);
    book.add(order);
    expect(book.buys.length).toEqual(1);
  });
  it('should add a market order to an empty book', () => {
    const order: Order = {
      id: 1,
      amount: 100,
      side: 'buy',
      type: 'market',
    };
    expect(book.buys.length).toEqual(0);
    book.add(order);
    expect(book.buys.length).toEqual(1);
  });
  it('should order the buys from lowest price to highest, with market orders at the end', () => {
    // These trades are in the correct order:
    const trades: Order[] = [
      { id: 1, amount: 100, price: 1.21, side: 'buy', type: 'limit' },
      { id: 2, amount: 100, price: 1.29, side: 'buy', type: 'limit' },
      { id: 3, amount: 100, price: 1.31, side: 'buy', type: 'limit' },
      { id: 4, amount: 100, price: 1.34, side: 'buy', type: 'limit' },
      { id: 5, amount: 100, price: 1.35, side: 'buy', type: 'limit' },
      { id: 6, amount: 100, side: 'buy', type: 'market' },
    ];
    _.shuffle(trades).forEach((each) => book.add(each));
    expect(book.buys.map((e) => e.id)).toStrictEqual(trades.map((e) => e.id));
  });
  it('should order the sells from highest price to lowest, with market orders at the end', () => {
    // These trades are in the correct order:
    const trades: Order[] = [
      { id: 1, amount: 100, price: 1.35, side: 'sell', type: 'limit' },
      { id: 2, amount: 100, price: 1.34, side: 'sell', type: 'limit' },
      { id: 3, amount: 100, price: 1.31, side: 'sell', type: 'limit' },
      { id: 4, amount: 100, price: 1.29, side: 'sell', type: 'limit' },
      { id: 5, amount: 100, price: 1.21, side: 'sell', type: 'limit' },
      { id: 6, amount: 100, side: 'sell', type: 'market' },
    ];
    _.shuffle(trades).forEach((each) => book.add(each));
    expect(book.sells.map((e) => e.id)).toStrictEqual(trades.map((e) => e.id));
  });
  it('should remove the correct buy order', () => {
    book.add({ id: 1, amount: 100, price: 1.21, side: 'buy', type: 'limit' });
    book.add({ id: 2, amount: 100, price: 1.31, side: 'buy', type: 'limit' });
    book.add({ id: 3, amount: 100, price: 1.35, side: 'buy', type: 'limit' });
    book.removeBuyOrder(2);
    expect(book.buys.map((e) => e.id).includes(3)).toBeFalsy();
  });
  it('should remove the correct sell order', () => {
    book.add({ id: 1, amount: 100, price: 1.35, side: 'sell', type: 'limit' });
    book.add({ id: 2, amount: 100, price: 1.31, side: 'sell', type: 'limit' });
    book.add({ id: 3, amount: 100, price: 1.21, side: 'sell', type: 'limit' });
    book.removeSellOrder(2);
    expect(book.sells.map((e) => e.id).includes(3)).toBeFalsy();
  });
});
