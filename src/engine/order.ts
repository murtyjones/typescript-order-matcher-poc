import { IOrder, OrderId } from 'types';

class Order implements IOrder {
  public id: OrderId;
  public amount: number;
  public price: number;
  public side: 'buy' | 'sell';

  constructor(props: IOrder) {
    this.id = props.id;
    this.amount = props.amount;
    this.price = props.price;
    this.side = props.side;
  }

  static fromJSON = (order: string): Order => {
    return new Order(JSON.parse(order) as IOrder);
  };

  toJSON = (): string => {
    const { id, amount, price, side } = this;
    const t: IOrder = {
      id,
      amount,
      price,
      side,
    };
    return JSON.stringify(t);
  };
}
