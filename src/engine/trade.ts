import { ITrade } from 'types';

class Trade implements ITrade {
  public takerOrderId: number;
  public makerOrderId: number;
  public amount: number;
  public price: number;

  constructor(props: ITrade) {
    this.takerOrderId = props.takerOrderId;
    this.makerOrderId = props.makerOrderId;
    this.amount = props.amount;
    this.price = props.price;
  }

  static fromJSON = (order: string): Trade => {
    return new Trade(JSON.parse(order) as ITrade);
  };

  toJSON = (): string => {
    const { takerOrderId, makerOrderId, amount, price } = this;
    const t: ITrade = {
      takerOrderId,
      makerOrderId,
      amount,
      price,
    };
    return JSON.stringify(t);
  };
}
