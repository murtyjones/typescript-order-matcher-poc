import { OrderBook } from 'engine/orderBook';
import { Order } from 'types';

describe('Order Book', () => {
  it('should add an order to the book', () => {
    const book = new OrderBook();
    const order: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
    expect(book.buys.length).toEqual(0);
    book.add(order);
    expect(book.buys.length).toEqual(1);
  });

  it('should order the buys from lowest price to highest', () => {
    const book = new OrderBook();
    book.add({ id: 1, amount: 100, price: 1.31, side: 'buy' });
    book.add({ id: 1, amount: 100, price: 1.35, side: 'buy' });
    book.add({ id: 1, amount: 100, price: 1.21, side: 'buy' });
    book.add({ id: 2, amount: 100, price: 1.29, side: 'buy' });
    book.add({ id: 3, amount: 100, price: 1.34, side: 'buy' });
    const buyPrices = book.buys.map((e) => e.price);
    const isSortedLowestToHighest = (a: number, b: number) => a - b;
    expect(buyPrices).toStrictEqual(buyPrices.sort(isSortedLowestToHighest));
  });

  it('should order the sells from highest price to lowest', () => {
    const book = new OrderBook();
    book.add({ id: 1, amount: 100, price: 1.31, side: 'sell' });
    book.add({ id: 1, amount: 100, price: 1.35, side: 'sell' });
    book.add({ id: 1, amount: 100, price: 1.21, side: 'sell' });
    book.add({ id: 2, amount: 100, price: 1.29, side: 'sell' });
    book.add({ id: 3, amount: 100, price: 1.34, side: 'sell' });
    const sellPrices = book.sells.map((e) => e.price);
    const isSortedHighestToLowest = (a: number, b: number) => b - a;
    expect(sellPrices).toStrictEqual(sellPrices.sort(isSortedHighestToLowest));
  });

  it('should remove the correct buy order', () => {
    const book = new OrderBook();
    book.add({ id: 1, amount: 100, price: 1.21, side: 'buy' });
    book.add({ id: 1, amount: 100, price: 1.31, side: 'buy' });
    book.add({ id: 1, amount: 100, price: 1.35, side: 'buy' });
    book.removeBuyOrder(1);
    expect(book.buys.map((e) => e.price).includes(1.31)).toBeFalsy();
  });

  it('should remove the correct sell order', () => {
    const book = new OrderBook();
    book.add({ id: 1, amount: 100, price: 1.35, side: 'sell' });
    book.add({ id: 1, amount: 100, price: 1.31, side: 'sell' });
    book.add({ id: 1, amount: 100, price: 1.21, side: 'sell' });
    book.removeSellOrder(1);
    expect(book.sells.map((e) => e.price).includes(1.31)).toBeFalsy();
  });
});
