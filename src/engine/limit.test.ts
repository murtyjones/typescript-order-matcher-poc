import { Limit } from 'engine/limit';
import { OrderBook } from 'engine/orderBook';
import { IOrder } from 'types';

describe('Limit order', () => {
  describe('a buy covered precisely by one sell order', () => {
    it('should execute when buy comes first', () => {
      const buy: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: IOrder = { id: 2, amount: 100, price: 1.29, side: 'sell' };
      const limit = new Limit(new OrderBook());
      limit.process(buy);
      limit.process(sell);
      expect(limit.book.buys.length).toBe(0);
      expect(limit.book.sells.length).toBe(0);
    });

    it('should execute when buy comes second', () => {
      const buy: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: IOrder = { id: 2, amount: 100, price: 1.29, side: 'sell' };
      const limit = new Limit(new OrderBook());
      limit.process(sell);
      limit.process(buy);
      expect(limit.book.buys.length).toBe(0);
      expect(limit.book.sells.length).toBe(0);
    });
  });

  describe('a buy order with no matching sell', () => {
    it('should not execute when the buy happens first', () => {
      const buy: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: IOrder = { id: 2, amount: 100, price: 1.3, side: 'sell' };
      const limit = new Limit(new OrderBook());
      limit.process(buy);
      limit.process(sell);
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.sells.length).toBe(1);
    });

    it('should not execute when the buy happens second', () => {
      const buy: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: IOrder = { id: 2, amount: 100, price: 1.3, side: 'sell' };
      const limit = new Limit(new OrderBook());
      limit.process(sell);
      limit.process(buy);
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.sells.length).toBe(1);
    });
  });

  describe('a buy fully covered by multiple sells', () => {
    it('should fully execute when buy happens first', () => {
      const buy: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: IOrder[] = [
        { id: 2, amount: 33, price: 1.29, side: 'sell' },
        { id: 3, amount: 33, price: 1.27, side: 'sell' },
        { id: 4, amount: 35, price: 1.29, side: 'sell' },
      ];
      const limit = new Limit(new OrderBook());
      limit.process(buy);
      sells.forEach((each) => {
        limit.process(each);
      });
      expect(limit.book.buys.length).toBe(0);
      expect(limit.book.sells.length).toBe(1);
      expect(limit.book.sells[0]!.price).toBe(1.29);
      expect(limit.book.sells[0]!.amount).toBe(1);
    });

    it('should fully execute when buy happens second', () => {
      const buy: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: IOrder[] = [
        { id: 2, amount: 33, price: 1.29, side: 'sell' },
        { id: 3, amount: 33, price: 1.27, side: 'sell' },
        { id: 4, amount: 35, price: 1.29, side: 'sell' },
      ];
      const limit = new Limit(new OrderBook());
      sells.forEach((each) => {
        limit.process(each);
      });
      limit.process(buy);
      expect(limit.book.buys.length).toBe(0);
      expect(limit.book.sells.length).toBe(1);
      expect(limit.book.sells[0]!.price).toBe(1.29);
      expect(limit.book.sells[0]!.amount).toBe(1);
    });
  });

  describe('a buy partially covered by multiple sells', () => {
    it('should partially execute when buy happens first', () => {
      const buy: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: IOrder[] = [
        { id: 2, amount: 1, price: 1.29, side: 'sell' },
        { id: 3, amount: 20, price: 1.3, side: 'sell' },
      ];
      const limit = new Limit(new OrderBook());
      limit.process(buy);
      sells.forEach((each) => {
        limit.process(each);
      });
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.buys[0]!.price).toBe(1.29);
      expect(limit.book.buys[0]!.amount).toBe(99);
      expect(limit.book.sells.length).toBe(1);
      expect(limit.book.sells[0]!.price).toBe(1.3);
      expect(limit.book.sells[0]!.amount).toBe(20);
    });

    it('should partially execute when buy happens second', () => {
      const buy: IOrder = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: IOrder[] = [
        { id: 2, amount: 1, price: 1.29, side: 'sell' },
        { id: 3, amount: 20, price: 1.3, side: 'sell' },
      ];
      const limit = new Limit(new OrderBook());
      sells.forEach((each) => {
        limit.process(each);
      });
      limit.process(buy);
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.buys[0]!.price).toBe(1.29);
      expect(limit.book.buys[0]!.amount).toBe(99);
      expect(limit.book.sells.length).toBe(1);
      expect(limit.book.sells[0]!.price).toBe(1.3);
      expect(limit.book.sells[0]!.amount).toBe(20);
    });
  });
});
