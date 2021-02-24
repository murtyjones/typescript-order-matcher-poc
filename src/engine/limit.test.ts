import { Limit } from 'engine/limit';
import { OrderBook } from 'engine/orderBook';
import { Order } from 'types';

describe('Limit order', () => {
  describe('a buy covered precisely by one sell order', () => {
    it('should execute when buy comes first', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: Order = { id: 2, amount: 100, price: 1.29, side: 'sell' };
      const limit = new Limit(new OrderBook());
      limit.process(buy);
      limit.process(sell);
      expect(limit.book.buys.length).toBe(0);
      expect(limit.book.sells.length).toBe(0);
    });

    it('should execute when buy comes second', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: Order = { id: 2, amount: 100, price: 1.29, side: 'sell' };
      const limit = new Limit(new OrderBook());
      limit.process(sell);
      limit.process(buy);
      expect(limit.book.buys.length).toBe(0);
      expect(limit.book.sells.length).toBe(0);
    });
  });

  describe('a buy order with no matching sell', () => {
    it('should not execute when the buy happens first', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: Order = { id: 2, amount: 100, price: 1.3, side: 'sell' };
      const limit = new Limit(new OrderBook());
      limit.process(buy);
      limit.process(sell);
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.sells.length).toBe(1);
    });

    it('should not execute when the buy happens second', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: Order = { id: 2, amount: 100, price: 1.3, side: 'sell' };
      const limit = new Limit(new OrderBook());
      limit.process(sell);
      limit.process(buy);
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.sells.length).toBe(1);
    });
  });

  describe('a buy fully covered by multiple sells', () => {
    it('should fully execute when buying happens first', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: Order[] = [
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

    it('should fully execute when buying happens second', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: Order[] = [
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

  describe('a sell fully covered by multiple buys', () => {
    it('should fully execute when buying happens first', () => {
      const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
      const buys: Order[] = [
        { id: 2, amount: 1, price: 1.29, side: 'buy' },
        { id: 3, amount: 20, price: 1.3, side: 'buy' },
        { id: 4, amount: 90, price: 1.31, side: 'buy' },
      ];
      const limit = new Limit(new OrderBook());
      buys.forEach((each) => {
        limit.process(each);
      });
      limit.process(sell);
      expect(limit.book.sells.length).toBe(0);
      expect(limit.book.buys.length).toBe(2);
      expect(limit.book.buys[0]!.price).toBe(1.29);
      expect(limit.book.buys[0]!.amount).toBe(1);
      expect(limit.book.buys[1]!.price).toBe(1.3);
      expect(limit.book.buys[1]!.amount).toBe(10);
    });

    it('should fully execute when buying happens second', () => {
      const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
      const buys: Order[] = [
        { id: 2, amount: 1, price: 1.29, side: 'buy' },
        { id: 3, amount: 20, price: 1.3, side: 'buy' },
        { id: 4, amount: 90, price: 1.31, side: 'buy' },
      ];
      const limit = new Limit(new OrderBook());
      limit.process(sell);
      buys.forEach((each) => {
        limit.process(each);
      });
      expect(limit.book.sells.length).toBe(0);
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.buys[0]!.price).toBe(1.31);
      expect(limit.book.buys[0]!.amount).toBe(11);
    });
  });

  describe('a buy partially covered by multiple sells', () => {
    it('should partially execute when buying happens first', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: Order[] = [
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

    it('should partially execute when buying happens second', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: Order[] = [
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

  describe('a sell partially covered by multiple buys', () => {
    it('should partially execute when buying happens first', () => {
      const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
      const buys: Order[] = [
        { id: 2, amount: 1, price: 1.28, side: 'buy' },
        { id: 2, amount: 1, price: 1.29, side: 'buy' },
        { id: 3, amount: 20, price: 1.3, side: 'buy' },
      ];
      const limit = new Limit(new OrderBook());
      buys.forEach((each) => {
        limit.process(each);
      });
      limit.process(sell);
      expect(limit.book.sells.length).toBe(1);
      expect(limit.book.sells[0]!.price).toBe(1.29);
      expect(limit.book.sells[0]!.amount).toBe(79);
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.buys[0]!.price).toBe(1.28);
      expect(limit.book.buys[0]!.amount).toBe(1);
    });

    it('should partially execute when buying happens second', () => {
      const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
      const buys: Order[] = [
        { id: 2, amount: 1, price: 1.28, side: 'buy' },
        { id: 2, amount: 1, price: 1.29, side: 'buy' },
        { id: 3, amount: 20, price: 1.3, side: 'buy' },
      ];
      const limit = new Limit(new OrderBook());
      limit.process(sell);
      buys.forEach((each) => {
        limit.process(each);
      });
      expect(limit.book.sells.length).toBe(1);
      expect(limit.book.sells[0]!.price).toBe(1.29);
      expect(limit.book.sells[0]!.amount).toBe(79);
      expect(limit.book.buys.length).toBe(1);
      expect(limit.book.buys[0]!.price).toBe(1.28);
      expect(limit.book.buys[0]!.amount).toBe(1);
    });
  });
});
