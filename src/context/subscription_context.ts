import { Subscription } from '../entities/subscription';
import { Product } from '../entities/product';
import { createContext } from 'react';

export type SubscriptionContextProps = {
  subscription?: Subscription;
  products?: Product[];
  subscribe: (priceId: string) => Promise<void>;
  createStripePortal: () => Promise<string>;
  subscribeInApple: (productId: string) => Promise<void>;
};

export const SubscriptionContext = createContext<SubscriptionContextProps>(
  {} as SubscriptionContextProps,
);
