import { Order } from 'types';
import { getMaxPrice, getMinPrice } from 'utils';

const orders: Order[] = [
  { id: 1, amount: 1, price: 1.29, side: 'buy', type: 'limit' },
  { id: 2, amount: 1, price: 1.31, side: 'sell', type: 'limit' },
  { id: 3, amount: 1, price: 1.3, side: 'sell', type: 'limit' },
  { id: 4, amount: 1, side: 'sell', type: 'market' },
];

test('getMinPrice should find the min price', () => {
  expect(getMinPrice(orders)).toBe(1.29);
});

test('getMaxPrice should find the max price', () => {
  expect(getMaxPrice(orders)).toBe(1.31);
});
