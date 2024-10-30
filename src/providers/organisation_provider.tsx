import { useEffect, useState } from 'react';
import { initialOrganisation, Organisation } from '../entities/organisation';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { OrganisationContext } from '../context/organisation_context';

const OrganisationProvider = ({ children }: { children: React.ReactNode }) => {
  const [organisation, setOrganisation] = useState<Organisation>();
  const organisationsCollection = firestore().collection('organisations-test');

  const createOrganisation = async (
    organisation: Organisation & { id: string },
  ) => {
    await organisationsCollection.doc(organisation.id).set(organisation);
  };
  const updateOrganisation = async (
    organisation: Partial<Organisation> & { id: string },
  ) => {
    await organisationsCollection.doc(organisation.id).update(organisation);
  };
  const deleteOrganisation = async (id: string) => {
    await organisationsCollection.doc(id).delete();
  };
  useEffect(() => {
    auth().onAuthStateChanged(async user => {
      if (user) {
        const organisationsCollection =
          firestore().collection('organisations-test');
        const q = organisationsCollection
          .where('userId', '==', user.uid)
          .limit(1);
        q.onSnapshot(querySnapshot => {
          const data = querySnapshot.docs.map(doc => doc.data());
          if (data.length > 0) {
            setOrganisation(data[0] as Organisation);
          } else {
            setOrganisation(initialOrganisation);
          }
        });
      }
    });
  }, []);

  return (
    <OrganisationContext.Provider
      value={{
        organisation,
        update: updateOrganisation,
        create: createOrganisation,
        deleteOrganisation,
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
};

export default OrganisationProvider;
