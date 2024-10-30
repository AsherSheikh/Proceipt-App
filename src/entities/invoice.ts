import { Timestamp } from '@firebase/firestore';
import { Reminder } from './reminder';
import { InvoiceItemWithQuantity } from './invoice_item';
import { Discount } from './discount';
import { Tax } from './tax';
import { Customer } from './customer';

export type Invoice = {
  id: string;
  number: string;
  organisationId: string;
  userId: string;
  customer: Customer;
  description: string;
  issuedAt: Timestamp;
  dueAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp | null;
  status: 'paid' | 'pending';
  items: InvoiceItemWithQuantity[];
  reminders: Reminder[];
  discount: Discount | null;
  tax: Tax | null;
  currency: string;
  notes: string;
};
