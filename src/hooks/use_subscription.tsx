import { useContext } from 'react';
import { SubscriptionContext } from '../context/subscription_context';

const useSubscription = () => {
  const subscriptionContext = useContext(SubscriptionContext);

  if (!subscriptionContext) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider',
    );
  }
  return subscriptionContext;
};

export default useSubscription;
