import { OrderBook } from 'engine/orderBook';
import { IOrder } from 'types';

test('should add an order to the book', () => {
  const book = new OrderBook();
  const order: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
  expect(book.buys.length).toEqual(0);
  book.add(order);
  expect(book.buys.length).toEqual(1);
});

test('should order the buys from lowest price to highest', () => {
  const book = new OrderBook();
  book.add({ id: 1, amount: 100, price: 1.31, side: 'buy' });
  book.add({ id: 2, amount: 100, price: 1.29, side: 'buy' });
  book.add({ id: 3, amount: 100, price: 1.3, side: 'buy' });
  expect(book.buys.map((e) => e.price)).toStrictEqual([1.29, 1.3, 1.31]);
});

test('should order the sells from highest price to lowest', () => {
  const book = new OrderBook();
  book.add({ id: 1, amount: 100, price: 1.31, side: 'sell' });
  book.add({ id: 2, amount: 100, price: 1.29, side: 'sell' });
  book.add({ id: 3, amount: 100, price: 1.3, side: 'sell' });
  expect(book.sells.map((e) => e.price)).toStrictEqual([1.31, 1.3, 1.29]);
});
