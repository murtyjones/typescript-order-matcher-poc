import { OrderBook } from 'engine/orderBook';
import { Processor } from 'engine/processor';
import _ from 'lodash';
import { LimitOrder, MarketOrder, Order, Trade } from 'types';
import { getMaxPrice } from 'utils';

jest.unmock('engine/limit');

describe('Order Processor', () => {
  let processor = new Processor(new OrderBook());
  beforeEach(() => {
    processor = new Processor(new OrderBook());
  });
  it('should throw if no order type passed', () => {
    const order = {} as Order;
    expect(() => {
      processor.process(order);
    }).toThrowError('Order side not recognized!');
  });
  describe('one market buy and one market sell', () => {
    const sell: MarketOrder = {
      id: 1,
      amount: 1,
      side: 'sell',
      type: 'market',
    };
    const buy: MarketOrder = {
      id: 1,
      amount: 1,
      side: 'buy',
      type: 'market',
    };
    describe('when buying happen first', () => {
      it('return execute no trades', () => {
        expect([
          ...processor.process({ ...buy }),
          ...processor.process({ ...sell }),
        ]).toHaveLength(0);
      });
    });
    describe('when buying happen second', () => {
      it('return execute no trades', () => {
        expect([
          ...processor.process({ ...sell }),
          ...processor.process({ ...buy }),
        ]).toHaveLength(0);
      });
    });
  });
  describe('a buy covered precisely by one market sell order', () => {
    const buy: LimitOrder = {
      id: 1,
      amount: 100,
      price: 1.3,
      side: 'buy',
      type: 'limit',
    };
    const sell: MarketOrder = {
      id: 2,
      amount: 100,
      side: 'sell',
      type: 'market',
    };
    const trade: Trade = {
      makerOrderId: sell.id,
      takerOrderId: buy.id,
      amount: 100,
      price: 1.3,
    };
    it('should return just one trade', () => {
      processor.process({ ...sell });
      expect(processor.process({ ...buy })).toStrictEqual([trade]);
    });
    it('leave no open buys', () => {
      processor.process({ ...sell });
      processor.process({ ...buy });
      expect(processor.getOrders('buy')).toHaveLength(0);
    });
    it('leave no open sells', () => {
      processor.process({ ...sell });
      processor.process({ ...buy });
      expect(processor.getOrders('sell')).toHaveLength(0);
    });
    it('should return no trades with amounts of zero', () => {
      processor.process({ ...sell });
      const trades = processor.process({ ...buy });
      expect(trades.map((e) => e.amount).includes(0)).toBe(false);
    });
  });
  describe('a sell covered precisely by one market buy order', () => {
    const buy: MarketOrder = {
      id: 1,
      amount: 100,
      side: 'buy',
      type: 'market',
    };
    const sell: LimitOrder = {
      id: 2,
      amount: 100,
      price: 1.3,
      side: 'sell',
      type: 'limit',
    };
    const trade: Trade = {
      makerOrderId: buy.id,
      takerOrderId: sell.id,
      amount: 100,
      price: 1.3,
    };
    it('should return just one trade', () => {
      processor.process({ ...buy });
      expect(processor.process({ ...sell })).toStrictEqual([trade]);
    });
    it('leave no open buys', () => {
      processor.process({ ...buy });
      processor.process({ ...sell });
      expect(processor.getOrders('buy')).toHaveLength(0);
    });
    it('leave no open sells', () => {
      processor.process({ ...buy });
      processor.process({ ...sell });
      expect(processor.getOrders('sell')).toHaveLength(0);
    });
    it('should return no trades with amounts of zero', () => {
      processor.process({ ...buy });
      const trades = processor.process({ ...sell });
      expect(trades.map((e) => e.amount).includes(0)).toBe(false);
    });
  });
  describe('a buy covered precisely by one limit sell order', () => {
    const buy: LimitOrder = {
      id: 1,
      amount: 100,
      price: 1.3,
      side: 'buy',
      type: 'limit',
    };
    const sell: LimitOrder = {
      id: 2,
      amount: 100,
      price: 1.29,
      side: 'sell',
      type: 'limit',
    };
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
        expect(processor.getOrders('buy')).toHaveLength(0);
      });
      it('leave no open sells', () => {
        processor.process({ ...buy });
        processor.process({ ...sell });
        expect(processor.getOrders('sell')).toHaveLength(0);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          processor.process({ ...buy }),
          processor.process({ ...sell }),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
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
        expect(processor.getOrders('buy')).toHaveLength(0);
      });
      it('leave no open sells', () => {
        processor.process({ ...sell });
        processor.process({ ...buy });
        expect(processor.getOrders('sell')).toHaveLength(0);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          processor.process({ ...sell }),
          processor.process({ ...buy }),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
      });
    });
  });
  describe('a buy order with no matching sell', () => {
    const buy: LimitOrder = {
      id: 1,
      amount: 100,
      price: 1.29,
      side: 'buy',
      type: 'limit',
    };
    const sell: LimitOrder = {
      id: 2,
      amount: 100,
      price: 1.3,
      side: 'sell',
      type: 'limit',
    };
    describe('when buys happen first', () => {
      it('should return no trades', () => {
        expect(processor.process({ ...buy })).toStrictEqual([]);
        expect(processor.process({ ...sell })).toStrictEqual([]);
      });
      it('should leave the buy order in the book', () => {
        processor.process({ ...buy });
        processor.process({ ...sell });
        expect(processor.getOrders('buy')).toHaveLength(1);
      });
      it('should leave the sell order in the book', () => {
        processor.process({ ...buy });
        processor.process({ ...sell });
        expect(processor.getOrders('sell')).toHaveLength(1);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          processor.process({ ...buy }),
          processor.process({ ...sell }),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
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
        expect(processor.getOrders('buy')).toHaveLength(1);
      });
      it('should leave the sell order in the book', () => {
        processor.process({ ...sell });
        processor.process({ ...buy });
        expect(processor.getOrders('sell')).toHaveLength(1);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          processor.process({ ...sell }),
          processor.process({ ...buy }),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
      });
    });
  });
  describe('a buy fully covered by multiple sells', () => {
    const buy: LimitOrder = {
      id: 1,
      amount: 100,
      price: 1.29,
      side: 'buy',
      type: 'limit',
    };
    const sells: LimitOrder[] = [
      { id: 2, amount: 33, price: 1.29, side: 'sell', type: 'limit' },
      { id: 3, amount: 33, price: 1.27, side: 'sell', type: 'limit' },
      { id: 4, amount: 35, price: 1.29, side: 'sell', type: 'limit' },
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
          _.flatten(sells.map((each) => processor.process({ ...each })))
        ).toStrictEqual(trades);
      });
      it('should leave no buys in the book', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('buy')).toHaveLength(0);
      });
      it('should leave one sell in the book', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('sell')).toHaveLength(1);
      });
      it('should leave one share leftover for the final sell order', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('sell')[0]!.amount).toBe(1);
      });
      it('should leave the order with the max price in the book', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        const remaining = processor.getOrders('sell')[0]!;
        expect((remaining as LimitOrder).price).toBe(maxPrice);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          processor.process({ ...buy }),
          _.flatten(sells.map((each) => processor.process({ ...each }))),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
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
          _.flatten(sells.map((each) => processor.process({ ...each })))
        ).toStrictEqual([]);
        expect(processor.process({ ...buy })).toStrictEqual(trades);
      });
      it('should leave no buys in the book', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.getOrders('buy')).toHaveLength(0);
      });
      it('should leave one sell in the book', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.getOrders('sell')).toHaveLength(1);
      });
      it('should leave one share left in the remaining sell', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.getOrders('sell')[0]!.amount).toBe(1);
      });
      it('should leave the highest price in the sells', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        const remaining = processor.getOrders('sell')[0]!;
        expect((remaining as LimitOrder).price).toBe(maxPrice);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          _.flatten(sells.map((each) => processor.process({ ...each }))),
          processor.process({ ...buy }),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
      });
    });
  });
  describe('a sell fully covered by multiple buys', () => {
    const sell: LimitOrder = {
      id: 1,
      amount: 100,
      price: 1.29,
      side: 'sell',
      type: 'limit',
    };
    const buys: LimitOrder[] = [
      { id: 2, amount: 1, price: 1.29, side: 'buy', type: 'limit' },
      { id: 3, amount: 20, price: 1.3, side: 'buy', type: 'limit' },
      { id: 4, amount: 90, price: 1.31, side: 'buy', type: 'limit' },
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
          _.flatten(buys.map((each) => processor.process({ ...each })))
        ).toStrictEqual([]);
        expect(processor.process({ ...sell })).toStrictEqual(trades);
      });
      it('should leave no sells', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.getOrders('sell')).toHaveLength(0);
      });
      it('should leave two buys', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.getOrders('buy')).toHaveLength(2);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          _.flatten(buys.map((each) => processor.process({ ...each }))),
          processor.process({ ...sell }),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
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
          _.flatten(buys.map((each) => processor.process({ ...each })))
        ).toStrictEqual(trades);
      });
      it('should leave no sells', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('sell')).toHaveLength(0);
      });
      it('should leave one buys because of the order the buys rolled in', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('buy')).toHaveLength(1);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          processor.process({ ...sell }),
          _.flatten(buys.map((each) => processor.process({ ...each }))),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
      });
    });
  });
  describe('a buy partially covered by multiple sells', () => {
    const buy: LimitOrder = {
      id: 1,
      amount: 100,
      price: 1.29,
      side: 'buy',
      type: 'limit',
    };
    const sells: LimitOrder[] = [
      { id: 2, amount: 1, price: 1.29, side: 'sell', type: 'limit' },
      { id: 3, amount: 20, price: 1.3, side: 'sell', type: 'limit' },
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
          _.flatten(sells.map((each) => processor.process({ ...each })))
        ).toStrictEqual(trades);
      });
      it('should leave one buy', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('buy')).toHaveLength(1);
      });
      it('should leave 99 of the 100 shares in the buy', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('buy')[0]!.amount).toBe(99);
      });
      it('should leave one sell', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('sell')).toHaveLength(1);
      });
      it('should leave the too-expensive sell with its original share count', () => {
        processor.process({ ...buy });
        sells.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('sell')[0]!.amount).toBe(sells[1]!.amount);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          processor.process({ ...buy }),
          _.flatten(sells.map((each) => processor.process({ ...each }))),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
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
          _.flatten(sells.map((each) => processor.process({ ...each })))
        ).toStrictEqual([]);
        expect(processor.process({ ...buy })).toStrictEqual(trades);
      });
      it('should leave one buy', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.getOrders('buy')).toHaveLength(1);
      });
      it('should take one share off of the buy', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.getOrders('buy')[0]!.amount).toBe(99);
      });
      it('should leave one sell', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.getOrders('sell')).toHaveLength(1);
      });
      it('should leave the too-expensive sell share count unchanged', () => {
        sells.map((each) => processor.process({ ...each }));
        processor.process({ ...buy });
        expect(processor.getOrders('sell')[0]!.amount).toBe(20);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          _.flatten(sells.map((each) => processor.process({ ...each }))),
          processor.process({ ...buy }),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
      });
    });
  });
  describe('a sell partially covered by multiple buys', () => {
    const sell: LimitOrder = {
      id: 1,
      amount: 100,
      price: 1.29,
      side: 'sell',
      type: 'limit',
    };
    const buys: LimitOrder[] = [
      { id: 2, amount: 1, price: 1.28, side: 'buy', type: 'limit' },
      { id: 3, amount: 1, price: 1.29, side: 'buy', type: 'limit' },
      { id: 4, amount: 20, price: 1.3, side: 'buy', type: 'limit' },
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
          _.flatten(buys.map((each) => processor.process({ ...each })))
        ).toStrictEqual([]);
        expect(processor.process({ ...sell })).toStrictEqual(trades);
      });
      it('should leave one sell', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.getOrders('sell')).toHaveLength(1);
      });
      it('should leave 79 shares on the sell', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.getOrders('sell')[0]!.amount).toBe(79);
      });
      it('should leave one buy', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.getOrders('buy')).toHaveLength(1);
      });
      it('should leave the too-cheap buy share count unchanged', () => {
        buys.map((each) => processor.process({ ...each }));
        processor.process({ ...sell });
        expect(processor.getOrders('buy')[0]!.amount).toBe(buys[0!]!.amount);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          _.flatten(buys.map((each) => processor.process({ ...each }))),
          processor.process({ ...sell }),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
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
          _.flatten(buys.map((each) => processor.process({ ...each })))
        ).toStrictEqual(trades);
      });
      it('should leave one sell', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('sell')).toHaveLength(1);
      });
      it('should leave 79 sell shares', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('sell')[0]!.amount).toBe(79);
      });
      it('should leave one buy', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('buy')).toHaveLength(1);
      });
      it('should leave the too-cheap buy share count unchanged', () => {
        processor.process({ ...sell });
        buys.map((each) => processor.process({ ...each }));
        expect(processor.getOrders('buy')[0]!.amount).toBe(1);
      });
      it('should return no trades with amounts of zero', () => {
        const trades = _.flatten([
          processor.process({ ...sell }),
          _.flatten(buys.map((each) => processor.process({ ...each }))),
        ]);
        expect(trades.map((e) => e.amount).includes(0)).toBe(false);
      });
    });
  });
});
