import { OrderBook } from 'engine/orderBook';
import { Processor } from 'engine/processor';
import flatten from 'lodash.flatten';
import { Order, Trade } from 'types';
import { getMaxPrice } from 'utils';

describe('Order Processor', () => {
  let processor = new Processor(new OrderBook());
  beforeEach(() => {
    processor = new Processor(new OrderBook());
  });
  it('should throw if invalid data passed', () => {
    const order = {} as Order;
    expect(() => processor.process(order)).toThrowError(
      'Order side not recognized!'
    );
  });
  describe('a buy covered precisely by one sell order', () => {
    const buy: Order = { id: 1, amount: 100, price: 1.3, side: 'buy' };
    const sell: Order = { id: 2, amount: 100, price: 1.29, side: 'sell' };
    describe('when buys happen first', () => {
      const trade: Trade = {
        takerOrderId: sell.id,
        makerOrderId: buy.id,
        amount: 100,
        price: 1.29,
      };
      it('should return just one trade', () => {
        expect(processor.process({ ...buy })).toStrictEqual([]);
        expect(processor.process({ ...sell })).toStrictEqual([trade]);
      });
      it('leave no open buys', () => {
        processor.process({ ...buy });
        processor.process({ ...sell });
        expect(processor.book.buys.length).toBe(0);
      });
      it('leave no open sells', () => {
        processor.process({ ...buy });
        processor.process({ ...sell });
        expect(processor.book.sells.length).toBe(0);
      });
    });
    describe('when buys happen second', () => {
      const trade: Trade = {
        makerOrderId: sell.id,
        takerOrderId: buy.id,
        amount: 100,
        price: 1.29,
      };
      it('should return just one trade', () => {
        expect(processor.process({ ...sell })).toStrictEqual([]);
        expect(processor.process({ ...buy })).toStrictEqual([trade]);
      });
      it('leave no open buys', () => {
        processor.process({ ...sell });
        processor.process({ ...buy });
        expect(processor.book.buys.length).toBe(0);
      });
      it('leave no open sells', () => {
        processor.process({ ...sell });
        processor.process({ ...buy });
        expect(processor.book.sells.length).toBe(0);
      });
    });
  });
  describe('a buy order with no matching sell', () => {
    const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
    const sell: Order = { id: 2, amount: 100, price: 1.3, side: 'sell' };
    describe('when buys happen first', () => {
      it('should return no trades', () => {
        expect(processor.process({ ...buy })).toStrictEqual([]);
        expect(processor.process({ ...sell })).toStrictEqual([]);
      });
      it('should leave the buy order in the book', () => {
        processor.process({ ...buy });
        processor.process({ ...sell });
        expect(processor.book.buys.length).toBe(1);
      });
      it('should leave the sell order in the book', () => {
        processor.process({ ...buy });
        processor.process({ ...sell });
        expect(processor.book.sells.length).toBe(1);
      });
    });
    describe('when buys happen second', () => {
      it('should return no trades', () => {
        expect(processor.process({ ...sell })).toStrictEqual([]);
        expect(processor.process({ ...buy })).toStrictEqual([]);
      });
      it('should leave the buy order in the book', () => {
        processor.process({ ...sell });
        processor.process({ ...buy });
        expect(processor.book.buys.length).toBe(1);
      });
      it('should leave the sell order in the book', () => {
        processor.process({ ...sell });
        processor.process({ ...buy });
        expect(processor.book.sells.length).toBe(1);
      });
    });
  });
  describe('a buy fully covered by multiple sells', () => {
    const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
    const sells: Order[] = [
      { id: 2, amount: 33, price: 1.29, side: 'sell' },
      { id: 3, amount: 33, price: 1.27, side: 'sell' },
      { id: 4, amount: 35, price: 1.29, side: 'sell' },
    ];
    const maxPrice = getMaxPrice([buy, ...sells]);
    describe('when buys happen first', () => {
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
      it('should return the expected trades', () => {
        expect(processor.process({ ...buy })).toStrictEqual([]);
        expect(
          flatten(sells.map((each) => processor.process({ ...each })))
        ).toStrictEqual(trades);
      });
      it('should leave no buys in the book', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.book.buys.length).toBe(0);
      });
      it('should leave one sell in the book', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.book.sells.length).toBe(1);
      });
      it('should leave one share leftover for the final sell order', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.book.sells[0]!.amount).toBe(1);
      });
      it('should leave the order with the max price in the book', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.book.sells[0]!.price).toBe(maxPrice);
      });
    });

    describe('when buys happen second', () => {
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
      it('should return the expected trades', () => {
        expect(
          flatten(sells.map((each) => processor.process({ ...each })))
        ).toStrictEqual([]);
        expect(processor.process({ ...buy })).toStrictEqual(trades);
      });
      it('should leave no buys in the book', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.book.buys.length).toBe(0);
      });
      it('should leave one sell in the book', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.book.sells.length).toBe(1);
      });
      it('should leave one share left in the remaining sell', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.book.sells[0]!.amount).toBe(1);
      });
      it('should leave the highest price in the sells', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.book.sells[0]!.price).toBe(maxPrice);
      });
    });
  });
  describe('a sell fully covered by multiple buys', () => {
    const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
    const buys: Order[] = [
      { id: 2, amount: 1, price: 1.29, side: 'buy' },
      { id: 3, amount: 20, price: 1.3, side: 'buy' },
      { id: 4, amount: 90, price: 1.31, side: 'buy' },
    ];
    describe('when buying happens first', () => {
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
      it('should return the expected trades', () => {
        expect(
          flatten(buys.map((each) => processor.process({ ...each })))
        ).toStrictEqual([]);
        expect(processor.process({ ...sell })).toStrictEqual(trades);
      });
      it('should leave no sells', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.book.sells.length).toBe(0);
      });
      it('should leave two buys', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.book.buys.length).toBe(2);
      });
    });
    describe('when buying happens second', () => {
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
      it('should return the expected trades', () => {
        expect(processor.process({ ...sell })).toStrictEqual([]);
        expect(
          flatten(buys.map((each) => processor.process({ ...each })))
        ).toStrictEqual(trades);
      });
      it('should leave no sells', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.book.sells.length).toBe(0);
      });
      it('should leave one buys because of the order the buys rolled in', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.book.buys.length).toBe(1);
      });
    });
  });
  describe('a buy partially covered by multiple sells', () => {
    const buy: Order = { id: 1, amount: 100, price: 1.29, side: 'buy' };
    const sells: Order[] = [
      { id: 2, amount: 1, price: 1.29, side: 'sell' },
      { id: 3, amount: 20, price: 1.3, side: 'sell' },
    ];
    describe('when buying happens first', () => {
      const trades: Trade[] = [
        {
          takerOrderId: sells[0]!.id,
          makerOrderId: buy.id,
          price: 1.29,
          amount: 1,
        },
      ];
      it('should return the expected trades', () => {
        expect(processor.process({ ...buy })).toStrictEqual([]);
        expect(
          flatten(sells.map((each) => processor.process({ ...each })))
        ).toStrictEqual(trades);
      });
      it('should leave one buy', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.book.buys.length).toBe(1);
      });
      it('should leave 99 of the 100 shares in the buy', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.book.buys[0]!.amount).toBe(99);
      });
      it('should leave one sell', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.book.sells.length).toBe(1);
      });
      it('should leave the too-expensive sell with its original share count', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.book.sells[0]!.amount).toBe(sells[1]!.amount);
      });
    });
    describe('when buying happens second', () => {
      const trades: Trade[] = [
        {
          makerOrderId: sells[0]!.id,
          takerOrderId: buy.id,
          price: 1.29,
          amount: 1,
        },
      ];
      it('should return the expected trades', () => {
        expect(
          flatten(sells.map((each) => processor.process({ ...each })))
        ).toStrictEqual([]);
        expect(processor.process({ ...buy })).toStrictEqual(trades);
      });
      it('should leave one buy', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.book.buys.length).toBe(1);
      });
      it('should take one share off of the buy', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.book.buys[0]!.amount).toBe(99);
      });
      it('should leave one sell', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.book.sells.length).toBe(1);
      });
      it('should leave the too-expensive sell share count unchanged', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.book.sells[0]!.amount).toBe(20);
      });
    });
  });
  describe('a sell partially covered by multiple buys', () => {
    const sell: Order = { id: 1, amount: 100, price: 1.29, side: 'sell' };
    const buys: Order[] = [
      { id: 2, amount: 1, price: 1.28, side: 'buy' },
      { id: 3, amount: 1, price: 1.29, side: 'buy' },
      { id: 4, amount: 20, price: 1.3, side: 'buy' },
    ];
    describe('when buying happens first', () => {
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
      it('should return the expected trades', () => {
        expect(
          flatten(buys.map((each) => processor.process({ ...each })))
        ).toStrictEqual([]);
        expect(processor.process({ ...sell })).toStrictEqual(trades);
      });
      it('should leave one sell', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.book.sells.length).toBe(1);
      });
      it('should leave 79 shares on the sell', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.book.sells[0]!.amount).toBe(79);
      });
      it('should leave one buy', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.book.buys.length).toBe(1);
      });
      it('should leave the too-cheap buy share count unchanged', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.book.buys[0]!.amount).toBe(buys[0!]!.amount);
      });
    });

    describe('when buying happens second', () => {
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
      it('should return the expected trades', () => {
        expect(processor.process({ ...sell })).toStrictEqual([]);
        expect(
          flatten(buys.map((each) => processor.process({ ...each })))
        ).toStrictEqual(trades);
      });
      it('should leave one sell', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.book.sells.length).toBe(1);
      });
      it('should leave 79 sell shares', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.book.sells[0]!.amount).toBe(79);
      });
      it('should leave one buy', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.book.buys.length).toBe(1);
      });
      it('should leave the too-cheap buy share count unchanged', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.book.buys[0]!.amount).toBe(1);
      });
    });
  });
});
