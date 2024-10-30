import { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { InvoiceItem } from '../entities/invoice_item';
import { InvoiceItemContext } from '../context/invoice_item_context';
import auth from '@react-native-firebase/auth';

const InvoiceItemProvider = ({ children }: { children: React.ReactNode }) => {
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>();
  const invoiceItemsCollection = firestore().collection('invoice-items-test');

  const create = async (item: InvoiceItem) => {
    await invoiceItemsCollection.doc(item.id).set(item);
  };

  const update = async (item: Partial<InvoiceItem> & { id: string }) => {
    await invoiceItemsCollection.doc(item.id).update(item);
  };

  const deleteInvoiceItem = async (id: string) => {
    await invoiceItemsCollection.doc(id).delete();
  };
  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        invoiceItemsCollection
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .onSnapshot(
            snapshot => {
              const data = snapshot.docs.map(doc => doc.data());
              setInvoiceItems(data as InvoiceItem[]);
            },
            error => {
              console.log(error);
            },
          );
      }
    });
  }, []);

  return (
    <InvoiceItemContext.Provider
      value={{
        items: invoiceItems,
        create,
        update,
        deleteInvoiceItem,
      }}
    >
      {children}
    </InvoiceItemContext.Provider>
  );
};

export default InvoiceItemProvider;
