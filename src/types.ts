export type OrderId = number;

interface BaseOrder {
  id: OrderId;
  amount: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
}

export interface LimitOrder extends BaseOrder {
  price: number;
  type: 'limit';
}

export interface MarketOrder extends BaseOrder {
  type: 'market';
}

export type Order = MarketOrder | LimitOrder;

export interface Trade {
  takerOrderId: number;
  makerOrderId: number;
  amount: number;
  price: number;
}
