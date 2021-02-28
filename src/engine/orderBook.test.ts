import { OrderBook } from 'engine/orderBook';
import _ from 'lodash';
import { Order } from 'types';

describe('Order Book', () => {
  let book = new OrderBook();
  beforeEach(() => {
    book = new OrderBook();
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
  it('should place market orders at the end of the buys', () => {
    book.add({ id: 1, amount: 100, side: 'buy', type: 'market' });
    book.add({ id: 2, amount: 100, side: 'buy', type: 'limit', price: 1.29 });
    expect(book.buys[0]!.id).toBe(2);
    expect(book.buys[1]!.id).toBe(1);
  });
  it('should place market orders at the end of the sells', () => {
    book.add({ id: 1, amount: 100, side: 'sell', type: 'market' });
    book.add({ id: 2, amount: 100, side: 'sell', type: 'limit', price: 1.29 });
    expect(book.sells[0]!.id).toBe(2);
    expect(book.sells[1]!.id).toBe(1);
  });
  it('should place the earliest added order later in the buy book', () => {
    book.add({ id: 1, amount: 100, side: 'buy', type: 'limit', price: 1.29 });
    book.add({ id: 2, amount: 100, side: 'buy', type: 'limit', price: 1.29 });
    expect(book.buys[0]!.id).toBe(2);
    expect(book.buys[1]!.id).toBe(1);
  });
  it('should place the earliest added order later in the sell book', () => {
    book.add({ id: 1, amount: 100, side: 'sell', type: 'limit', price: 1.29 });
    book.add({ id: 2, amount: 100, side: 'sell', type: 'limit', price: 1.29 });
    expect(book.sells[0]!.id).toBe(2);
    expect(book.sells[1]!.id).toBe(1);
  });
  it('should order the buys from lowest price to highest', () => {
    // These trades are in the correct order:
    const trades: Order[] = [
      { id: 1, amount: 100, price: 1.21, side: 'buy', type: 'limit' },
      { id: 2, amount: 100, price: 1.29, side: 'buy', type: 'limit' },
      { id: 3, amount: 100, price: 1.31, side: 'buy', type: 'limit' },
      { id: 4, amount: 100, price: 1.31, side: 'buy', type: 'limit' },
      { id: 5, amount: 100, price: 1.34, side: 'buy', type: 'limit' },
      { id: 6, amount: 100, price: 1.35, side: 'buy', type: 'limit' },
      { id: 7, amount: 100, side: 'buy', type: 'market' },
    ];
    _.shuffle(trades).forEach((each) => book.add(each));
    expect(book.buys[0]!.id).toBe(1);
    expect(book.buys[1]!.id).toBe(2);
    expect([3, 4]).toContain(book.buys[2]!.id);
    expect([3, 4]).toContain(book.buys[3]!.id);
    expect(book.buys[4]!.id).toBe(5);
    expect(book.buys[5]!.id).toBe(6);
    expect(book.buys[6]!.id).toBe(7);
  });
  it('should order the sells from highest price to lowest', () => {
    // These trades are in the correct order:
    const trades: Order[] = [
      { id: 1, amount: 100, price: 1.35, side: 'sell', type: 'limit' },
      { id: 2, amount: 100, price: 1.34, side: 'sell', type: 'limit' },
      { id: 3, amount: 100, price: 1.31, side: 'sell', type: 'limit' },
      { id: 4, amount: 100, price: 1.31, side: 'sell', type: 'limit' },
      { id: 5, amount: 100, price: 1.29, side: 'sell', type: 'limit' },
      { id: 6, amount: 100, price: 1.21, side: 'sell', type: 'limit' },
      { id: 7, amount: 100, side: 'sell', type: 'market' },
    ];
    _.shuffle(trades).forEach((each) => book.add(each));
    expect(book.sells[0]!.id).toBe(1);
    expect(book.sells[1]!.id).toBe(2);
    expect([3, 4]).toContain(book.sells[2]!.id);
    expect([3, 4]).toContain(book.sells[3]!.id);
    expect(book.sells[4]!.id).toBe(5);
    expect(book.sells[5]!.id).toBe(6);
    expect(book.sells[6]!.id).toBe(7);
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
