export function currencyFormat(num: number) {
  return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export const currencyFormatter = Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'GBP',
});

export function removeCurrencySymbol(price: string): string {
  const regex = /[^\d.]+/g;
  return price.replace(regex, '');
}
