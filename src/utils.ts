import { Order } from 'types';

export const getMinPrice = (orders: Order[]): number => {
  return orders.reduce((acc, each) => {
    if (each.price < acc) {
      acc = each.price;
    }
    return acc;
  }, Infinity);
};

export const getMaxPrice = (orders: Order[]): number => {
  return orders.reduce((acc, each) => {
    if (each.price > acc) {
      acc = each.price;
    }
    return acc;
  }, 0);
};
