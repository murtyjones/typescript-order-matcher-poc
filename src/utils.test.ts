import { Order } from 'types';
import { getMaxPrice, getMinPrice } from 'utils';

const orders: Order[] = [
  { id: 1, amount: 1, price: 1.29, side: 'buy', type: 'limit' },
  { id: 2, amount: 1, price: 1.31, side: 'sell', type: 'limit' },
  { id: 3, amount: 1, price: 1.3, side: 'sell', type: 'limit' },
  { id: 4, amount: 1, side: 'sell', type: 'market' },
];

const marketOnly: Order[] = [
  { id: 1, amount: 1, side: 'buy', type: 'market' },
  { id: 2, amount: 2, side: 'buy', type: 'market' },
];

test('getMinPrice should find the min price', () => {
  expect(getMinPrice(orders)).toBe(1.29);
});

test('getMinPrice should throw if no min price', () => {
  expect(() => getMinPrice(marketOnly)).toThrowError(
    'Only market orders found'
  );
});

test('getMaxPrice should find the max price', () => {
  expect(getMaxPrice(orders)).toBe(1.31);
});

test('getMaxPrice should throw if no min price', () => {
  expect(() => getMaxPrice(marketOnly)).toThrowError(
    'Only market orders found'
  );
});
