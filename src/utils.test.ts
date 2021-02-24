import { Order } from 'types';
import { getMaxPrice, getMinPrice } from 'utils';

const orders: Order[] = [
  { id: 1, amount: 1, price: 1.29, side: 'buy' },
  { id: 1, amount: 1, price: 1.31, side: 'sell' },
  { id: 1, amount: 1, price: 1.3, side: 'sell' },
];

test('getMinPrice should find the min price', () => {
  expect(getMinPrice(orders)).toBe(1.29);
});

test('getMaxPrice should find the max price', () => {
  expect(getMaxPrice(orders)).toBe(1.31);
});
