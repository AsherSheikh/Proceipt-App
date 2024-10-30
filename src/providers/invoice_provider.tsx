import firestore from '@react-native-firebase/firestore';
import { InvoiceContext } from '../context/invoice_context';
import { useEffect, useState } from 'react';
import { Invoice } from '../entities/invoice';
import auth from '@react-native-firebase/auth';
import uuid from 'react-native-uuid';

const InvoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>();
  const invoicesCollection = firestore().collection('invoices-test');

  const create = async (invoice: Invoice) => {
    await invoicesCollection.doc(invoice.id).set(invoice);
  };

  const update = async (invoice: Partial<Invoice> & { id: string }) => {
    await invoicesCollection.doc(invoice.id).update(invoice);
  };

  const markAsPaid = async (id: string) => {
    await invoicesCollection.doc(id).update({ status: 'paid' });
  };

  const markAsUnpaid = async (id: string) => {
    await invoicesCollection.doc(id).update({ status: 'pending' });
  };

  const duplicate = async (invoice: Invoice) => {
    try {
      const updatedInvoice: Invoice = {
        ...invoice,
        id: uuid.v4() as string,
        createdAt: firestore.Timestamp.now(),
        updatedAt: null,
        status: 'pending',
        number: `${invoice.number}-copy`,
        reminders: [],
      };

      await create(updatedInvoice);
      return updatedInvoice;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const deleteInvoice = async (id: string) => {
    await invoicesCollection.doc(id).delete();
  };
  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        invoicesCollection
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
            const data = snapshot.docs.map(doc => doc.data());
            setInvoices(data as Invoice[]);
          });
      }
    });
  }, []);

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        markAsPaid,
        create,
        update,
        delete: deleteInvoice,
        markAsUnpaid,
        duplicate,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export default InvoiceProvider;
