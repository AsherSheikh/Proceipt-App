import { useEffect, useState } from 'react';
import { Subscription } from '../entities/subscription';
import { Product } from '../entities/product';
import firestore from '@react-native-firebase/firestore';
import { Organisation } from '../entities/organisation';
import auth from '@react-native-firebase/auth';
import { Linking, Platform } from 'react-native';
import functions from '@react-native-firebase/functions';
import { trialDaysRemaining } from '../utils/date';
import { SubscriptionContext } from '../context/subscription_context';
import Toast from 'react-native-toast-message';
import {
  Purchase,
  PurchaseError,
  requestSubscription,
  useIAP,
  validateReceiptIos,
} from 'react-native-iap';

const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const productsCollection = firestore().collection('products');
  const [subscription, setSubscription] = useState<Subscription>();
  const [products, setProducts] = useState<Product[]>();

  const subscriptionSkus = Platform.select({
    ios: ['personal_plan'],
  })!;
  const {
    connected,
    subscriptions,
    getSubscriptions,
    currentPurchase,
    finishTransaction,
    purchaseHistory,
    getPurchaseHistory,
    getProducts,
  } = useIAP();

  const organisationsWhiteList = [
    'OsRR6HJ8fdo8xc6T0Dlur',
    '01HRYJ9A991CSEQ55W946X5KBR',
    '01HW3QB0B7FJ6254QG56H8JKDH',
  ];

  const handleGetPurchaseHistory = async () => {
    try {
      await getPurchaseHistory();
    } catch (error) {
      console.log('purchase history error', error);
    }
  };

  useEffect(() => {
    handleGetPurchaseHistory();
  }, [connected]);

  useEffect(() => {
    getProducts({ skus: subscriptionSkus })
      .then(() => {
        console.log('products gotten');
      })
      .catch(error => {
        console.log('failed to get products', error);
      });
  }, []);

  const handleGetSubscriptions = async () => {
    try {
      await getSubscriptions({ skus: subscriptionSkus });
    } catch (error) {
      console.log('subscription error', error);
    }
  };

  useEffect(() => {
    handleGetSubscriptions();
  }, [connected]);

  useEffect(() => {
    // ... listen if connected, purchaseHistory and subscriptions exist
    if (
      purchaseHistory.find(
        x => x.productId === (subscriptionSkus[0] || subscriptionSkus[1]),
      )
    ) {
      console.log('Subscription exists from purchase history');
    }
  }, [connected, purchaseHistory, subscriptions]);

  const retrieveUserOrganisation = async (userId: string) => {
    try {
      const snapshot = await firestore()
        .collection('organisations-test')
        .where('userId', '==', userId)
        .limit(1)
        .get();
      if (snapshot.empty) {
        return;
      }
      return snapshot.docs[0].data() as Organisation;
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
  const handleBuySubscription = async (productId: string) => {
    try {
      await requestSubscription({
        sku: productId,
      });
    } catch (error) {
      if (error instanceof PurchaseError) {
        console.log('buy error', error.message);
      } else {
        console.log('buy error', error);
      }
    }
  };

  useEffect(() => {
    const checkCurrentPurchase = async (purchase?: Purchase) => {
      if (purchase) {
        try {
          const receipt = purchase.transactionReceipt;
          if (receipt) {
            if (Platform.OS === 'ios') {
              //send receipt body to apple server to validete
              const appleReceiptResponse = await validateReceiptIos({
                receiptBody: {
                  'receipt-data': receipt,
                  password: '87d8f3bf4e394a748469d05455858583',
                },
                isTest: true,
              });

              //if receipt is valid
              if (appleReceiptResponse) {
                const { status } = appleReceiptResponse;
                if (status) {
                  console.log({ status });
                  console.log('Purchase validated successfully!');
                }
              }

              return;
            }
          }
        } catch (error) {
          console.log('error', error);
        }
      }
    };
    checkCurrentPurchase(currentPurchase);
  }, [currentPurchase, finishTransaction]);

  const subscribe = async (priceId: string) => {
    const userId = auth().currentUser?.uid;
    const customerCol = firestore().collection('customers');
    const customerRef = customerCol.doc(userId!);
    const customerDoc = await customerRef.get();
    const successUrl = `https://proceipt.com/checkout-success`;
    const cancelUrl = `https://proceipt.com/pricing-new-2`;
    if (customerDoc.exists) {
      const docRef = firestore()
        .collection('customers')
        .doc(userId!)
        .collection('checkout_sessions');
      const { path } = await docRef.add({
        price: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      firestore()
        .doc(path)
        .onSnapshot(snap => {
          const { error, url } = snap.data() as any;
          if (error) {
            throw error;
          }
          if (url) {
            Linking.canOpenURL(url)
              .then(supported => {
                if (supported) {
                  Linking.openURL(url);
                }
              })
              .catch(error => {
                console.log(error);
              });
          }
        });
    } else {
      const createStripeCustomer = functions().httpsCallable(
        'createStripeCustomer',
      );
      await createStripeCustomer({ email: auth().currentUser!.email });
      const docRef = firestore()
        .collection('customers')
        .doc(userId!)
        .collection('checkout_sessions');
      const { path } = await docRef.add({
        price: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      firestore()
        .doc(path)
        .onSnapshot(snap => {
          const { error, url } = snap.data() as any;
          if (error) {
            throw error;
          }
          if (url) {
            Linking.canOpenURL(url)
              .then(supported => {
                if (supported) {
                  Linking.openURL(url);
                }
              })
              .catch(error => {
                console.log(error);
              });
          }
        });
    }
  };

  const createStripePortal = async () => {
    const userId = auth().currentUser?.uid;
    const customerCol = firestore().collection('customers');
    const customerRef = customerCol.doc(userId!);
    const customerDoc = await customerRef.get();
    const customerData = customerDoc.data();
    const createPortalLink = functions().httpsCallable('createPortalLink');
    const { data } = (await createPortalLink({
      customerId: customerData?.stripeId,
      returnUrl: `https://proceipt.com`,
    })) as {
      data: {
        url: string;
      };
    };
    return data.url;
  };

  const retrieveSubscription = async (userId: string) => {
    try {
      const organisation = await retrieveUserOrganisation(userId);
      if (!organisation) {
        return setSubscription({
          remainingTrialDays: 0,
          activePlanId: null,
          active: false,
          onFreeTrial: false,
        });
      }
      if (organisationsWhiteList.includes(organisation.id)) {
        return setSubscription({
          remainingTrialDays: 7,
          activePlanId: null,
          active: true,
          onFreeTrial: true,
        });
      }

      const daysRemainingInTrial = trialDaysRemaining(organisation.createdAt);
      const customerSubscriptionData = await firestore()
        .collection('customers')
        .doc(userId)
        .collection('subscriptions')
        .orderBy('created', 'desc')
        .limit(1)
        .get();

      if (customerSubscriptionData.empty) {
        return setSubscription({
          remainingTrialDays: daysRemainingInTrial,
          activePlanId: null,
          active: daysRemainingInTrial > 0,
          onFreeTrial: daysRemainingInTrial > 0,
        });
      }

      const latestSessionData = customerSubscriptionData.docs[0].data();
      if (latestSessionData.status === 'active') {
        const priceId = latestSessionData.price.path.split('/').pop();
        return setSubscription({
          remainingTrialDays: daysRemainingInTrial,
          activePlanId: priceId,
          active: true,
          onFreeTrial: false,
        });
      }
      return setSubscription({
        remainingTrialDays: 0,
        onFreeTrial: false,
        activePlanId: null,
        active: false,
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  };

  const retrieveProducts = async () => {
    const querySnapshot = await productsCollection
      .where('organisation', '==', false)
      .get();
    const data = querySnapshot.docs.map(doc => {
      const { name, price_id, metadata, amount, cancelled_amount } = doc.data();
      const product: Product = {
        priceId: price_id,
        name,
        features: Object.values(metadata) as string[],
        amount: amount,
        cancelledAmount: cancelled_amount,
      };
      return product;
    });

    data.sort((a, b) => a.amount - b.amount);
    setProducts(data);
  };

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        retrieveSubscription(user.uid)
          .then(() => {})
          .catch((e: any) => {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: e.message,
            });
          });
      }
    });
  }, []);

  useEffect(() => {
    retrieveProducts();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        products,
        subscribe,
        createStripePortal,
        subscribeInApple: handleBuySubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;
