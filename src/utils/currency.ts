export const currencyFormatter = (currency: string) => {
  return new Intl.NumberFormat('default', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  });
};
