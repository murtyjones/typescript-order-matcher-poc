import { OrderBook } from 'engine/orderBook';
import { Processor } from 'engine/processor';
import flatten from 'lodash.flatten';
import { Order, Trade } from 'types';

describe('Limit order', () => {
  let processor = new Processor(new OrderBook());

  beforeEach(() => {
    processor = new Processor(new OrderBook());
  });

  describe('a buy covered precisely by one sell order', () => {
    it('should execute when buy comes first', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.3, side: 'buy' };
      const sell: Order = { id: 2, amount: 100, price: 1.29, side: 'sell' };
      const trade: Trade = {
        takerOrderId: sell.id,
        makerOrderId: buy.id,
        amount: 100,
        price: 1.29,
      };

      expect(processor.process(buy)).toStrictEqual([]);
      expect(processor.process(sell)).toStrictEqual([trade]);
      expect(processor.book.buys.length).toBe(0);
      expect(processor.book.sells.length).toBe(0);
    });

    it('should execute when buy comes second', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.3, side: 'buy' };
      const sell: Order = { id: 2, amount: 100, price: 1.29, side: 'sell' };
      const trade: Trade = {
        takerOrderId: buy.id,
        makerOrderId: sell.id,
        amount: 100,
        price: 1.29,
      };

      expect(processor.process(sell)).toStrictEqual([]);
      expect(processor.process(buy)).toStrictEqual([trade]);
      expect(processor.book.buys.length).toBe(0);
      expect(processor.book.sells.length).toBe(0);
    });
  });

  describe('a buy order with no matching sell', () => {
    it('should not execute when the buy happens first', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: Order = { id: 2, amount: 100, price: 1.3, side: 'sell' };

      expect(processor.process(buy)).toStrictEqual([]);
      expect(processor.process(sell)).toStrictEqual([]);
      expect(processor.book.buys.length).toBe(1);
      expect(processor.book.sells.length).toBe(1);
    });

    it('should not execute when the buy happens second', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sell: Order = { id: 2, amount: 100, price: 1.3, side: 'sell' };

      expect(processor.process(sell)).toStrictEqual([]);
      expect(processor.process(buy)).toStrictEqual([]);
      expect(processor.book.buys.length).toBe(1);
      expect(processor.book.sells.length).toBe(1);
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
      const trades: Trade[] = [
        {
          takerOrderId: sells[0]!.id,
          makerOrderId: buy.id,
          amount: 33,
          price: 1.29,
        },
        {
          takerOrderId: sells[1]!.id,
          makerOrderId: buy.id,
          amount: 33,
          price: 1.27,
        },
        {
          takerOrderId: sells[2]!.id,
          makerOrderId: buy.id,
          amount: 34,
          price: 1.29,
        },
      ];

      expect(processor.process(buy)).toStrictEqual([]);
      expect(
        flatten(sells.map((each) => processor.process(each)))
      ).toStrictEqual(trades);
      expect(processor.book.buys.length).toBe(0);
      expect(processor.book.sells.length).toBe(1);
      expect(processor.book.sells[0]!.price).toBe(1.29);
      expect(processor.book.sells[0]!.amount).toBe(1);
    });

    it('should fully execute when buying happens second', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: Order[] = [
        { id: 2, amount: 33, price: 1.29, side: 'sell' },
        { id: 3, amount: 33, price: 1.27, side: 'sell' },
        { id: 4, amount: 35, price: 1.29, side: 'sell' },
      ];
      const trades: Trade[] = [
        {
          takerOrderId: buy.id,
          makerOrderId: sells[1]!.id,
          amount: 33,
          price: 1.27,
        },
        {
          takerOrderId: buy.id,
          makerOrderId: sells[0]!.id,
          amount: 33,
          price: 1.29,
        },
        {
          takerOrderId: buy.id,
          makerOrderId: sells[2]!.id,
          amount: 34,
          price: 1.29,
        },
      ];

      expect(
        flatten(sells.map((each) => processor.process(each)))
      ).toStrictEqual([]);
      expect(processor.process(buy)).toStrictEqual(trades);
      expect(processor.book.buys.length).toBe(0);
      expect(processor.book.sells.length).toBe(1);
      expect(processor.book.sells[0]!.price).toBe(1.29);
      expect(processor.book.sells[0]!.amount).toBe(1);
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
      const trades: Trade[] = [
        {
          takerOrderId: sell.id,
          makerOrderId: buys[2]!.id,
          amount: 90,
          price: sell.price,
        },
        {
          takerOrderId: sell.id,
          makerOrderId: buys[1]!.id,
          amount: 10,
          price: sell.price,
        },
      ];

      expect(
        flatten(buys.map((each) => processor.process(each)))
      ).toStrictEqual([]);
      expect(processor.process(sell)).toStrictEqual(trades);
      expect(processor.book.sells.length).toBe(0);
      expect(processor.book.buys.length).toBe(2);
      expect(processor.book.buys[0]!.price).toBe(1.29);
      expect(processor.book.buys[0]!.amount).toBe(1);
      expect(processor.book.buys[1]!.price).toBe(1.3);
      expect(processor.book.buys[1]!.amount).toBe(10);
    });

    it('should fully execute when buying happens second', () => {
      const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
      const buys: Order[] = [
        { id: 2, amount: 1, price: 1.29, side: 'buy' },
        { id: 3, amount: 20, price: 1.3, side: 'buy' },
        { id: 4, amount: 90, price: 1.31, side: 'buy' },
      ];
      const trades: Trade[] = [
        {
          takerOrderId: buys[0]!.id,
          makerOrderId: sell.id,
          price: 1.29,
          amount: 1,
        },
        {
          takerOrderId: buys[1]!.id,
          makerOrderId: sell.id,
          price: 1.29,
          amount: 20,
        },
        {
          takerOrderId: buys[2]!.id,
          makerOrderId: sell.id,
          price: 1.29,
          amount: 79,
        },
      ];

      expect(processor.process(sell)).toStrictEqual([]);
      expect(
        flatten(buys.map((each) => processor.process(each)))
      ).toStrictEqual(trades);
      expect(processor.book.sells.length).toBe(0);
      expect(processor.book.buys.length).toBe(1);
      expect(processor.book.buys[0]!.price).toBe(1.31);
      expect(processor.book.buys[0]!.amount).toBe(11);
    });
  });

  describe('a buy partially covered by multiple sells', () => {
    it('should partially execute when buying happens first', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: Order[] = [
        { id: 2, amount: 1, price: 1.29, side: 'sell' },
        { id: 3, amount: 20, price: 1.3, side: 'sell' },
      ];
      const trades: Trade[] = [
        {
          takerOrderId: sells[0]!.id,
          makerOrderId: buy.id,
          price: 1.29,
          amount: 1,
        },
      ];

      expect(processor.process(buy)).toStrictEqual([]);
      expect(
        flatten(sells.map((each) => processor.process(each)))
      ).toStrictEqual(trades);
      expect(processor.book.buys.length).toBe(1);
      expect(processor.book.buys[0]!.price).toBe(1.29);
      expect(processor.book.buys[0]!.amount).toBe(99);
      expect(processor.book.sells.length).toBe(1);
      expect(processor.book.sells[0]!.price).toBe(1.3);
      expect(processor.book.sells[0]!.amount).toBe(20);
    });

    it('should partially execute when buying happens second', () => {
      const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
      const sells: Order[] = [
        { id: 2, amount: 1, price: 1.29, side: 'sell' },
        { id: 3, amount: 20, price: 1.3, side: 'sell' },
      ];
      const trades: Trade[] = [
        {
          makerOrderId: sells[0]!.id,
          takerOrderId: buy.id,
          price: 1.29,
          amount: 1,
        },
      ];

      expect(
        flatten(sells.map((each) => processor.process(each)))
      ).toStrictEqual([]);
      expect(processor.process(buy)).toStrictEqual(trades);
      expect(processor.book.buys.length).toBe(1);
      expect(processor.book.buys[0]!.price).toBe(1.29);
      expect(processor.book.buys[0]!.amount).toBe(99);
      expect(processor.book.sells.length).toBe(1);
      expect(processor.book.sells[0]!.price).toBe(1.3);
      expect(processor.book.sells[0]!.amount).toBe(20);
    });
  });

  describe('a sell partially covered by multiple buys', () => {
    it('should partially execute when buying happens first', () => {
      const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
      const buys: Order[] = [
        { id: 2, amount: 1, price: 1.28, side: 'buy' },
        { id: 3, amount: 1, price: 1.29, side: 'buy' },
        { id: 4, amount: 20, price: 1.3, side: 'buy' },
      ];
      const trades: Trade[] = [
        {
          makerOrderId: buys[2]!.id,
          takerOrderId: sell.id,
          price: 1.29,
          amount: 20,
        },
        {
          makerOrderId: buys[1]!.id,
          takerOrderId: sell.id,
          price: 1.29,
          amount: 1,
        },
      ];

      expect(
        flatten(buys.map((each) => processor.process(each)))
      ).toStrictEqual([]);
      expect(processor.process(sell)).toStrictEqual(trades);
      expect(processor.book.sells.length).toBe(1);
      expect(processor.book.sells[0]!.price).toBe(1.29);
      expect(processor.book.sells[0]!.amount).toBe(79);
      expect(processor.book.buys.length).toBe(1);
      expect(processor.book.buys[0]!.price).toBe(1.28);
      expect(processor.book.buys[0]!.amount).toBe(1);
    });

    it('should partially execute when buying happens second', () => {
      const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
      const buys: Order[] = [
        { id: 2, amount: 1, price: 1.28, side: 'buy' },
        { id: 3, amount: 1, price: 1.29, side: 'buy' },
        { id: 4, amount: 20, price: 1.3, side: 'buy' },
      ];
      const trades: Trade[] = [
        {
          makerOrderId: sell.id,
          takerOrderId: buys[1]!.id,
          price: 1.29,
          amount: 1,
        },
        {
          makerOrderId: sell.id,
          takerOrderId: buys[2]!.id,
          price: 1.29,
          amount: 20,
        },
      ];

      expect(processor.process(sell)).toStrictEqual([]);
      expect(
        flatten(buys.map((each) => processor.process(each)))
      ).toStrictEqual(trades);
      expect(processor.book.sells.length).toBe(1);
      expect(processor.book.sells[0]!.price).toBe(1.29);
      expect(processor.book.sells[0]!.amount).toBe(79);
      expect(processor.book.buys.length).toBe(1);
      expect(processor.book.buys[0]!.price).toBe(1.28);
      expect(processor.book.buys[0]!.amount).toBe(1);
    });
  });
});
