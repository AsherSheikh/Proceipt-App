import { Timestamp } from '@firebase/firestore';
import { Address } from './address';

export type Customer = {
  id: string;
  organisationId: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  name: string;
  email: string;
  address: Address;
};
