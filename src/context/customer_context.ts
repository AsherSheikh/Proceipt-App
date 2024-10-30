import { createContext } from 'react';
import { Customer } from '../entities/customer';

export type CustomerContextProps = {
  customers?: Customer[];
  create: (customer: Customer) => Promise<void>;
  update: (customer: Partial<Customer> & { id: string }) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
};

export const CustomerContext = createContext<CustomerContextProps>(
  {} as CustomerContextProps,
);
