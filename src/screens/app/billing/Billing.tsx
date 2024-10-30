import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styleSheetFactory, theme, useTheme } from '../../../theme';
import React, { useEffect, useState } from 'react';
import useSubscription from '../../../hooks/use_subscription';
import { LeftArrow } from '../../../assets/svg/left-arrow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CheckMarkIcon from '../../../assets/svg/checkmark';
import ButtonComponent from '../../../components/button/button-component';
import Toast from 'react-native-toast-message';
import {
  confirmPlatformPayPayment,
  PlatformPay,
  PlatformPayButton,
  PlatformPayError,
} from '@stripe/stripe-react-native';
import auth from '@react-native-firebase/auth';
import { Product } from '../../../entities/product';
import { BlurView } from '@react-native-community/blur';
import { useIAP } from 'react-native-iap';

export const Billing = () => {
  const [styles] = useTheme(Styles);
  const { products, subscription, subscribe, createStripePortal } =
    useSubscription();
  const insets = useSafeAreaInsets();
  const { goBack } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingApplePay, setLoadingApplePay] = useState(false);
  const { products: iapProducts } = useIAP();

  const { height, width } = Dimensions.get('screen');

  useEffect(() => {
    if (iapProducts) {
      Toast.show({
        type: 'success',
        text1: `There are ${iapProducts.length} products`,
        text2: 'Products loaded',
      });
    }
  }, [iapProducts]);

  if (!products || !subscription) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true);
      await subscribe(priceId);
      Toast.show({
        type: 'success',
        text1: 'Redirecting to Stripe...',
      });
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: e.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePortal = async () => {
    try {
      setLoadingPortal(true);
      const url = await createStripePortal();
      await Linking.openURL(url);
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: e.message,
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  async function fetchPaymentClientSecret(priceId: string): Promise<string> {
    const body = {
      email: auth().currentUser?.email,
      priceId,
    };
    const response = await fetch(
      'https://proceipt-backend-8p3ie.ondigitalocean.app/payment/mobile',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    return data.clientSessionId as string;
  }

  const handleApplePay = async (product: Product) => {
    setLoadingApplePay(true);
    const clientSecret = await fetchPaymentClientSecret(product.priceId);
    const stripePortal = await createStripePortal();
    setLoadingApplePay(false);
    try {
      const { error } = await confirmPlatformPayPayment(clientSecret, {
        applePay: {
          request: {
            type: PlatformPay.PaymentRequestType.Recurring,
            description: 'Proceipt Invoice and Receipt Management',
            managementUrl: stripePortal,
            billing: {
              paymentType: PlatformPay.PaymentType.Recurring,
              intervalUnit: PlatformPay.IntervalUnit.Month,
              intervalCount: 1,
              label: `Proceipt ${product.name}`,
              amount: product.amount.toString(),
            },
          },
          merchantCountryCode: 'GB',
          currencyCode: 'GBP',
          cartItems: [
            {
              amount: product.amount.toString(),
              label: `Invoice & Receipt ${product.name}`,
              paymentType: PlatformPay.PaymentType.Recurring,
              intervalUnit: PlatformPay.IntervalUnit.Month,
              intervalCount: 1,
              startDate: Math.round(Date.now() / 1000),
            },
          ],
        },
      });
      if (error) {
        if (error.code === PlatformPayError.Canceled) {
          return;
        }
        if (error.code === PlatformPayError.Failed) {
          Toast.show({
            type: 'error',
            text1: 'Payment failed',
            text2:
              error.message || 'Please contact support for further assistance',
          });
        } else {
          Toast.show({
            type: 'error',
            text1:
              'We are unable to process your payment at this time. Please try again later.',
          });
        }
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1:
          'We are unable to process your payment at this time. Please try again later.',
      });
    }
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          paddingBottom: insets.bottom,
        }}
      >
        {loadingApplePay && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              zIndex: 100,
              left: 0,
              right: 0,
            }}
          >
            <BlurView
              style={{
                width,
                height,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator />
            </BlurView>
          </View>
        )}

        <View style={[styles.wrapper, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Pressable onPress={goBack} style={styles.leftHeader}>
              <LeftArrow color={theme.colors.text.darkGrey} />
              <Text style={styles.headerText}>Billing</Text>
            </Pressable>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <Text
            style={[styles.heading, { textAlign: 'center', marginBottom: 4 }]}
          >
            70% off after 7 days free trial – offer ends soon
          </Text>
          <Text style={styles.subText}>
            Simple transparent pricing that's always free to start.
          </Text>
          {products.map(product => (
            <View key={product.priceId} style={styles.card}>
              <Text style={[styles.heading, { marginBottom: 2 }]}>
                {product.name}
              </Text>
              <Text
                style={[
                  styles.subText,
                  { marginBottom: 10, textAlign: 'left' },
                ]}
              >
                Try it free for 7 days. No credit card required.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[
                    styles.heading,
                    {
                      fontSize: 22,
                      textAlign: 'left',
                      textDecorationLine: 'line-through',
                      textDecorationStyle: 'solid',
                      marginRight: 10,
                    },
                  ]}
                >
                  £{product.cancelledAmount}
                </Text>
                <Text
                  style={[
                    styles.heading,
                    {
                      fontSize: 34,
                      textAlign: 'left',
                    },
                  ]}
                >
                  £{product.amount}
                </Text>
                <Text
                  style={{
                    fontFamily: theme.font.regular,
                    color: theme.colors.text.main,
                    fontSize: 15,
                  }}
                >
                  {' '}
                  / month
                </Text>
              </View>
              <View style={{ marginBottom: 14 }}>
                {product.features.map(feature => (
                  <View
                    key={feature}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <CheckMarkIcon />
                    <Text
                      style={[
                        styles.subText,
                        { textAlign: 'left', marginBottom: 6, marginLeft: 4 },
                      ]}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              {Platform.OS === 'ios' ? (
                <>
                  {product.priceId === subscription?.activePlanId ? (
                    <ButtonComponent title={'Active'} disabled />
                  ) : (
                    <PlatformPayButton
                      onPress={() => handleApplePay(product)}
                      type={PlatformPay.ButtonType.Subscribe}
                      appearance={PlatformPay.ButtonStyle.Black}
                      borderRadius={4}
                      style={{
                        width: '100%',
                        height: 50,
                      }}
                    />
                  )}
                </>
              ) : (
                <ButtonComponent
                  loading={loading}
                  title={
                    product.priceId === subscription?.activePlanId
                      ? 'Active'
                      : 'Subscribe'
                  }
                  onPress={() => {
                    handleSubscribe(product.priceId);
                  }}
                  disabled={
                    product.priceId === subscription?.activePlanId || loading
                  }
                />
              )}
            </View>
          ))}
          <TouchableOpacity
            disabled={loadingPortal}
            onPress={handlePortal}
            style={styles.outlineBtn}
          >
            {loadingPortal ? (
              <ActivityIndicator />
            ) : (
              <Text>Manage Subscription</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      marginVertical: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      elevation: 0.4,
      borderWidth: 0.4,
      borderColor: theme.colors.grey.light,
    },

    outlineBtn: {
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.grey.dark,
      color: theme.colors.text.primary,
      backgroundColor: '#e8e8ee',
      paddingVertical: 12,
      paddingHorizontal: 14,
    },

    scrollViewContainer: {
      padding: '5%',
      flexGrow: 1,
    },
    subText: {
      color: theme.colors.text.main,
      fontFamily: theme.font.regular,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },

    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      backgroundColor: '#fff',
      padding: '5%',
    },
    header: {
      paddingTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heading: {
      fontFamily: theme.font.semibold,
      fontSize: 18,
      color: theme.colors.text.main,
      textTransform: 'capitalize',
    },

    button: {
      padding: theme.spacing.md,
      backgroundColor: '#89FA19',
      color: theme.colors.button.color,
      borderRadius: 14,
      minHeight: 55,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
  }),
);
