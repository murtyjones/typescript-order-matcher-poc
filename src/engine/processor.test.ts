import { OrderBook } from 'engine/orderBook';
import { Processor } from 'engine/processor';
import { Order } from 'types';
import { limitProcess } from '__mocks__/engine/limit';
import { marketProcess } from '__mocks__/engine/market';

jest.mock('engine/limit');

describe('Order Processor', () => {
  let processor = new Processor(new OrderBook());
  beforeEach(() => {
    processor = new Processor(new OrderBook());
  });
  it('should throw if no order type passed', () => {
    const order = {} as Order;
    expect(() => processor.process(order)).toThrowError(
      'Order type not recognized!'
    );
  });
  it('should call limit.process', () => {
    const order = { type: 'limit' } as Order;
    processor.process(order);
    expect(limitProcess).toBeCalledTimes(1);
  });
  it('should call market.process', () => {
    const order = { type: 'market' } as Order;
    processor.process(order);
    expect(marketProcess).toBeCalledTimes(1);
  });
});
