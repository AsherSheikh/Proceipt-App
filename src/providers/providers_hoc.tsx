import OrganisationProvider from './organisation_provider';
import InvoiceProvider from './invoice_provider';
import InvoiceItemProvider from './invoice_item_provider';
import CustomerProvider from './customer_provider';
import SubscriptionProvider from './subscription_provider';

const ProvidersHoc = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SubscriptionProvider>
        <OrganisationProvider>
          <InvoiceProvider>
            <InvoiceItemProvider>
              <CustomerProvider>{children}</CustomerProvider>
            </InvoiceItemProvider>
          </InvoiceProvider>
        </OrganisationProvider>
      </SubscriptionProvider>
    </>
  );
};

export default ProvidersHoc;
