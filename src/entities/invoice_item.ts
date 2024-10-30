import { Timestamp } from '@firebase/firestore';

export type InvoiceItem = {
  id: string;
  organisationId: string;
  userId: string;
  name: string;
  price: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
};

export type InvoiceItemWithQuantity = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};
