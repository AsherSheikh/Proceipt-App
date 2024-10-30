import { Timestamp } from '@firebase/firestore';
import { Tax } from './tax';
import { Discount } from './discount';
import { Customer } from './customer';
import { InvoiceItemWithQuantity } from './invoice_item';

export type Quote = {
  id: string;
  number: string;
  organisationId: string;
  userId: string;
  customer: Customer;
  description: string;
  issuedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  items: InvoiceItemWithQuantity[];
  discount: Discount | null;
  tax: Tax | null;
  currency: string;
  notes: string;
};
