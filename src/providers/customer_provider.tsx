import { useEffect, useState } from 'react';
import { Customer } from '../entities/customer';
import firestore from '@react-native-firebase/firestore';
import { CustomerContext } from '../context/customer_context';
import auth from '@react-native-firebase/auth';

const CustomerProvider = ({ children }: { children: React.ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>();
  const customersCollection = firestore().collection('customers-test');

  const create = async (customer: Customer) => {
    await customersCollection.doc(customer.id).set(customer);
  };

  const update = async (customer: Partial<Customer> & { id: string }) => {
    await customersCollection.doc(customer.id).update(customer);
  };

  const deleteCustomer = async (id: string) => {
    await customersCollection.doc(id).delete();
  };
  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        customersCollection
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
            const data = snapshot.docs.map(doc => doc.data());
            setCustomers(data as Customer[]);
          });
      }
    });
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        create,
        update,
        deleteCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export default CustomerProvider;
