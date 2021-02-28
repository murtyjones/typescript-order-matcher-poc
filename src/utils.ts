import { Order } from 'types';

export const getMinPrice = (orders: Order[]): number => {
  const minPrice = orders.reduce((acc, each) => {
    if ('price' in each && each.price < acc) {
      acc = each.price;
    }
    return acc;
  }, Infinity);
  if (minPrice === Infinity) {
    throw new Error('Only market orders found');
  }
  return minPrice;
};

export const getMaxPrice = (orders: Order[]): number => {
  const maxPrice = orders.reduce((acc, each) => {
    if ('price' in each && each.price > acc) {
      acc = each.price;
    }
    return acc;
  }, 0);
  if (maxPrice === 0) {
    throw new Error('Only market orders found');
  }
  return maxPrice;
};
