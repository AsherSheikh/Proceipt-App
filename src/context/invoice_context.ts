import { createContext } from 'react';
import { Invoice } from '../entities/invoice';

export type InvoiceContextProps = {
  invoices?: Invoice[];
  create: (invoice: Invoice) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  markAsUnpaid: (id: string) => Promise<void>;
  duplicate: (invoice: Invoice) => Promise<Invoice>;
  update: (invoice: Partial<Invoice> & { id: string }) => Promise<void>;
  delete: (id: string) => Promise<void>;
};

export const InvoiceContext = createContext<InvoiceContextProps>(
  {} as InvoiceContextProps,
);
