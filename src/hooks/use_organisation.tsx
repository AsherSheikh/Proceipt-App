import { useContext } from 'react';
import { OrganisationContext } from '../context/organisation_context';

const useOrganisation = () => {
  const organisationContext = useContext(OrganisationContext);
  if (!organisationContext) {
    throw new Error(
      'useOrganisation must be used within an OrganisationProvider',
    );
  }
  return organisationContext;
};

export default useOrganisation;
