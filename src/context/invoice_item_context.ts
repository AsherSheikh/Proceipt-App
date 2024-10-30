import { createContext } from 'react';
import { InvoiceItem } from '../entities/invoice_item';

export type InvoiceItemContextProps = {
  items?: InvoiceItem[];
  create: (item: InvoiceItem) => Promise<void>;
  update: (item: Partial<InvoiceItem> & { id: string }) => Promise<void>;
  deleteInvoiceItem: (id: string) => Promise<void>;
};

export const InvoiceItemContext = createContext<InvoiceItemContextProps>(
  {} as InvoiceItemContextProps,
);
