import { Invoice } from '../entities/invoice';
import { Quote } from '../entities/quote';

export const calculateBalanceDue = (data: Invoice | Quote) => {
  const { discount, tax } = data;
  const subTotal = data.items.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 0),
    0,
  );
  let result = subTotal;
  if (discount) {
    if (discount.type === 'fixed') {
      const minDiscount = Math.min(discount.value || 0, subTotal);
      result -= minDiscount;
    } else {
      result -= (subTotal * (discount.value || 0)) / 100;
    }
  }
  if (tax) {
    if (tax.type === 'fixed') {
      const minTax = Math.min(tax.value || 0, subTotal);
      result += minTax;
    } else {
      result += (subTotal * (tax.value || 0)) / 100;
    }
  }
  return result;
};
