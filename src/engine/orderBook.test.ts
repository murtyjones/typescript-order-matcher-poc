import { OrderBook } from 'engine/orderBook';
import { IOrder } from 'types';

test('should add an order to the book', () => {
  const order: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
  const book = new OrderBook();
  expect(book.buys.length).toEqual(0);
  book.add(order);
  expect(book.buys.length).toEqual(1);
});
