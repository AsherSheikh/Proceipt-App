import { useContext } from 'react';
import { InvoiceContext } from '../context/invoice_context';

const useInvoice = () => {
  const invoiceContext = useContext(InvoiceContext);

  if (!invoiceContext) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return invoiceContext;
};

export default useInvoice;
