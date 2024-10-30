import { useContext } from 'react';
import { InvoiceItemContext } from '../context/invoice_item_context';

const useInvoiceItem = () => {
  const invoiceItemContext = useContext(InvoiceItemContext);

  if (!invoiceItemContext) {
    throw new Error(
      'useInvoiceItem must be used within an InvoiceItemProvider',
    );
  }
  return invoiceItemContext;
};

export default useInvoiceItem;
