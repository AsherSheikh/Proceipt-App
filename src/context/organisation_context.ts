import { createContext } from 'react';
import { Organisation } from '../entities/organisation';

export type OrganisationContextProps = {
  organisation?: Organisation;
  create: (organisation: Organisation) => Promise<void>;
  update: (
    organisation: Partial<Organisation> & { id: string },
  ) => Promise<void>;
  deleteOrganisation: (id: string) => Promise<void>;
};

export const OrganisationContext = createContext<OrganisationContextProps>(
  {} as OrganisationContextProps,
);
