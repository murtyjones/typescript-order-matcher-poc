export type OrderId = number;

export interface IOrder {
  id: OrderId;
  amount: number;
  price: number;
  side: 'buy' | 'sell';
}

export interface ITrade {
  takerOrderId: number;
  makerOrderId: number;
  amount: number;
  price: number;
}
