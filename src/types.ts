export type OrderId = number;

export interface Order {
  id: OrderId;
  amount: number;
  price: number;
  side: 'buy' | 'sell';
}

export interface Trade {
  takerOrderId: number;
  makerOrderId: number;
  amount: number;
  price: number;
}
