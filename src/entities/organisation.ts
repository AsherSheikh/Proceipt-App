import { Timestamp } from '@firebase/firestore';
import { Address } from './address';

export type Organisation = {
  id: string;
  userId: string;
  name: string;
  createdAt: Timestamp;
  email: string;
  logo: string;
  phone: string;
  address: Address;
  currency: string;
};
export const initialOrganisation: Organisation = {
  id: '',
  name: '',
  createdAt: Timestamp.now(),
  email: '',
  logo: '',
  userId: '',
  phone: '',
  address: {
    country: '',
    address2: '',
    address1: '',
    state: '',
    zipcode: '',
    city: '',
  },
  currency: 'GBP',
};

export const emptyOrg = {
  ...initialOrganisation,
  id: '',
  name: 'N/A',
  email: 'N/A',
};
