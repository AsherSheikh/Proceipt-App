import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styleSheetFactory, theme, useTheme } from '../../../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { LeftArrow } from '../../../../assets/svg/left-arrow';
import React, { useMemo, useRef, useState } from 'react';
import { RootStackParameterList } from '../../../../navigation/navigator';
import ExportIcon from '../../../../assets/svg/export';
import { DotsIcon } from '../../../../assets/svg/dots';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import useInvoice from '../../../../hooks/use_invoice';
import Toast from 'react-native-toast-message';
import Share from 'react-native-share';
import InvoiceRow from '../components/invoice_row';
import EditIcon from '../../../../assets/svg/edit';
import UnpaidIcon from '../../../../assets/svg/unpaid';
import CheckMarkIcon from '../../../../assets/svg/checkmark';
import ShareLinkIcon from '../../../../assets/svg/share-link';
import ShareEmailIcon from '../../../../assets/svg/share-email';
import useOrganisation from '../../../../hooks/use_organisation';
import ButtonComponent from '../../../../components/button/button-component';
import { currencyFormatter } from '../../../../utils/currency';
import { formatTimestamp } from '../../../../utils/date';
import { ScrollView } from 'react-native-gesture-handler';
import CloseIcon from '../../../../assets/svg/close';

const InvoiceDetailsScreen = () => {
  const [styles] = useTheme(Styles);
  const insets = useSafeAreaInsets();
  const { goBack } = useNavigation();
  const { organisation } = useOrganisation();
  const { params } =
    useRoute<RouteProp<RootStackParameterList, 'InvoiceDetails'>>();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [modalType, setModalType] = useState<
    'MARK_AS' | 'SHARE' | 'OPTIONS' | 'E-MAIL'
  >('OPTIONS');
  const { markAsPaid, markAsUnpaid, invoices } = useInvoice();

  const initialInvoice =
    invoices?.find(invoice => invoice.id === params.id) || params;

  const [email, setEmail] = useState(initialInvoice.customer.email || '');
  const [subject, setSubject] = useState(
    `${organisation?.name} sent you an invoice (${params.number})`,
  );
  const [message, setMessage] = useState('Thanks for your business!');

  const [loading, setLoading] = useState(false);

  const snapPoints = useMemo(() => {
    if (modalType === 'SHARE') {
      return [220];
    }
    if (modalType === 'E-MAIL') {
      return [470];
    }
    return [350];
  }, [modalType]);

  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();
  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };

  const updateStatus = async (status: 'paid' | 'unpaid') => {
    try {
      if (status === 'paid') {
        await markAsPaid(initialInvoice.id);
      } else if (status === 'unpaid') {
        await markAsUnpaid(initialInvoice.id);
      }
      Toast.show({
        type: 'success',
        text1: `Invoice marked as ${status} successfully`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error marking invoice as paid',
      });
    }
  };
  const downloadInvoice = async () => {
    try {
      const url = `https://application.proceipt.com/download/invoices/${initialInvoice.id}?download=true`;
      await Linking.openURL(url);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error downloading invoice',
      });
    }
  };
  const shareViaLink = async () => {
    const url = `https://application.proceipt.com/download/invoices/${initialInvoice.id}`;
    try {
      await Share.open({
        url,
        failOnCancel: false,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error sharing invoice',
      });
    }
  };
  const sendEmail = async () => {
    const baseUrl = 'https://application.proceipt.com';
    const apiUrl = 'https://proceipt-backend-8p3ie.ondigitalocean.app';
    setLoading(true);
    const body = {
      to: [email],
      logo: organisation?.logo,
      subject:
        subject ||
        `${organisation?.name} sent you an invoice (${initialInvoice?.number})`,
      message,
      companyName: organisation?.name,
      link: `${baseUrl}/download/invoices/${initialInvoice?.id}`,
      type: 'invoice',
    };
    try {
      await fetch(`${apiUrl}/send-invoice`, {
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      Toast.show({
        type: 'success',
        text1: 'Email sent successfully',
      });
      bottomSheetRef.current?.close();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error sending email',
        text2: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const subTotal = initialInvoice.items.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );
  const calculateTax = () => {
    const { tax } = params;
    if (tax) {
      if (tax.type === 'fixed') {
        return tax.value;
      }
      if (tax.type === 'percentage') {
        return subTotal * (tax.value / 100);
      }
    }
    return 0;
  };

  const calculateDiscount = () => {
    const { discount } = initialInvoice;
    if (discount) {
      if (discount.type === 'fixed') {
        return discount.value;
      }
      if (discount.type === 'percentage') {
        return subTotal * (discount.value / 100);
      }
    }
    return 0;
  };
  const calculateBalanceDue = () => {
    let result = subTotal;
    const { discount, tax } = initialInvoice;
    if (discount) {
      if (discount.type === 'fixed') {
        const minDiscount = Math.min(discount.value || 0, subTotal);
        result -= minDiscount;
      } else {
        result -= (subTotal * (discount.value || 0)) / 100;
      }
    }
    if (tax) {
      if (tax.type === 'fixed') {
        const minTax = Math.min(tax.value || 0, subTotal);
        result += minTax;
      } else {
        result += (subTotal * (tax.value || 0)) / 100;
      }
    }
    return result;
  };

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.leftHeader}>
            <LeftArrow color={theme.colors.text.darkGrey} />
            <Text style={styles.headerText}>{initialInvoice?.number}</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 50,
        }}
        style={{
          paddingHorizontal: '5%',
          paddingTop: 20,
          flex: 1,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={downloadInvoice}
            style={[styles.primaryBtn, { width: 170, marginRight: 10 }]}
          >
            <ExportIcon color={'#fff'} />
            <Text
              style={{
                color: '#fff',
                marginLeft: theme.spacing.xs,
              }}
            >
              Download
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setModalType('OPTIONS');
              bottomSheetRef.current?.present();
            }}
          >
            <DotsIcon />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.stripe} />
          <View style={styles.bodyPadding}>
            <Text
              style={[
                styles.heading,
                { textTransform: 'uppercase', fontSize: 34, marginBottom: 5 },
              ]}
            >
              INVOICE
            </Text>
            <Text style={styles.invoiceNo}>{initialInvoice.number}</Text>
            <Text
              style={[
                styles.invoiceNo,
                { color: theme.colors.text.primary, marginBottom: 3 },
              ]}
            >
              Amount Due
            </Text>
            <Text style={styles.invoiceAmount}>
              {currencyFormatter(initialInvoice.currency).format(
                calculateBalanceDue(),
              )}
            </Text>
            {organisation!.logo ? (
              <View style={styles.logoContainer}>
                <Image
                  style={styles.logo}
                  source={{ uri: organisation!.logo }}
                />
              </View>
            ) : (
              <Text style={styles.logoText}>{organisation!.name}</Text>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.bodyPadding}>
            {initialInvoice.description && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Text style={styles.invoiceSubText}>Description :</Text>
                <Text style={styles.invoiceSubTextValue}>
                  {initialInvoice.description}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={styles.invoiceSubText}>Issued Date :</Text>
              <Text style={styles.invoiceSubTextValue}>
                {formatTimestamp(initialInvoice.issuedAt)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Text style={styles.invoiceSubText}>Due Date :</Text>
              <Text style={styles.invoiceSubTextValue}>
                {formatTimestamp(initialInvoice.dueAt)}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.bodyPadding}>
            <Text
              style={{
                fontFamily: theme.font.bold,
                color: '#6dbe23',
                fontSize: 18,
                marginBottom: 4,
              }}
            >
              FROM:
            </Text>
            <Text
              style={[
                styles.heading,
                { textTransform: undefined, marginBottom: 4 },
              ]}
            >
              {organisation?.name}
            </Text>
            {organisation?.address.address1 && (
              <Text style={styles.address}>
                {organisation.address.address1}
              </Text>
            )}
            {organisation?.address.address2 && (
              <Text style={styles.address}>
                {organisation.address.address2}
              </Text>
            )}
            {organisation?.address.city && (
              <Text style={styles.address}>{organisation.address.city}</Text>
            )}
            {organisation?.address.state && (
              <Text style={styles.address}>{organisation.address.state}</Text>
            )}
            {organisation?.address.zipcode && (
              <Text style={styles.address}>{organisation.address.zipcode}</Text>
            )}
            {organisation?.email && (
              <Text style={styles.address}>{organisation.email}</Text>
            )}

            <Text
              style={{
                fontFamily: theme.font.bold,
                color: '#6dbe23',
                fontSize: 18,
                marginTop: 20,
              }}
            >
              TO:
            </Text>
            <Text style={[styles.heading, { textTransform: undefined }]}>
              {initialInvoice?.customer.name}
            </Text>
            {initialInvoice.customer?.address.address1 && (
              <Text style={styles.address}>
                {initialInvoice.customer?.address.address1}
              </Text>
            )}
            {initialInvoice.customer?.address.address2 && (
              <Text style={styles.address}>
                {initialInvoice.customer?.address.address2}
              </Text>
            )}
            {initialInvoice.customer?.address.city && (
              <Text style={styles.address}>
                {initialInvoice.customer.address.city}
              </Text>
            )}
            {initialInvoice.customer?.address.state && (
              <Text style={styles.address}>
                {initialInvoice.customer?.address.state}
              </Text>
            )}
            {initialInvoice.customer?.address.zipcode && (
              <Text style={styles.address}>
                {initialInvoice.customer?.address.zipcode}
              </Text>
            )}
            {initialInvoice.customer?.email && (
              <Text style={styles.address}>
                {initialInvoice.customer?.email}
              </Text>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.bodyPadding}>
            {initialInvoice.items.map(item => {
              const total = (item.price || 1) * (item.quantity || 1);
              return (
                <View key={item.id} style={{ marginBottom: 10 }}>
                  <Text
                    style={[
                      styles.address,
                      { color: theme.colors.text.primary, marginBottom: 6 },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={[styles.address, { marginRight: 5 }]}>
                      {currencyFormatter(initialInvoice.currency).format(
                        item.price,
                      )}
                    </Text>
                    <CloseIcon width={20} height={20} />
                    <Text style={[styles.address, { marginLeft: 5 }]}>
                      {item.quantity}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}
                  >
                    <Text style={[styles.address, { marginRight: 5 }]}>
                      AMOUNT :{' '}
                    </Text>
                    <Text
                      style={[
                        styles.address,
                        {
                          color: theme.colors.text.primary,
                          fontFamily: theme.font.semibold,
                        },
                      ]}
                    >
                      {currencyFormatter(initialInvoice.currency).format(total)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.divider} />
          <View style={[styles.bodyPadding]}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginBottom: 10,
              }}
            >
              <Text style={[styles.address, { marginRight: 5 }]}>
                SUBTOTAL :
              </Text>
              <Text
                style={[
                  styles.address,
                  {
                    color: theme.colors.text.primary,
                    fontFamily: theme.font.semibold,
                  },
                ]}
              >
                {currencyFormatter(initialInvoice.currency).format(subTotal)}
              </Text>
            </View>
            {initialInvoice.tax && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginBottom: 10,
                }}
              >
                <Text style={[styles.address, { marginRight: 5 }]}>TAX :</Text>
                <Text
                  style={[
                    styles.address,
                    {
                      color: theme.colors.text.primary,
                      fontFamily: theme.font.semibold,
                    },
                  ]}
                >
                  {currencyFormatter(initialInvoice.currency).format(
                    calculateTax(),
                  )}
                </Text>
              </View>
            )}
            {initialInvoice.discount && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginBottom: 10,
                }}
              >
                <Text style={[styles.address, { marginRight: 5 }]}>
                  DISCOUNT :
                </Text>
                <Text
                  style={[
                    styles.address,
                    {
                      color: theme.colors.text.primary,
                      fontFamily: theme.font.semibold,
                    },
                  ]}
                >
                  {currencyFormatter(initialInvoice.currency).format(
                    calculateDiscount(),
                  )}
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginBottom: 10,
              }}
            >
              <Text style={[styles.address, { marginRight: 5 }]}>TOTAL :</Text>
              <Text
                style={[
                  styles.address,
                  {
                    color: theme.colors.text.primary,
                    fontFamily: theme.font.semibold,
                  },
                ]}
              >
                {currencyFormatter(initialInvoice.currency).format(
                  calculateBalanceDue(),
                )}
              </Text>
            </View>
          </View>
          {initialInvoice.notes && (
            <View
              style={[
                styles.bodyPadding,
                {
                  backgroundColor: '#dbfac0',
                  paddingBottom: 40,
                },
              ]}
            >
              <Text
                style={[
                  styles.address,
                  { color: theme.colors.text.primary, marginBottom: 6 },
                ]}
              >
                Notes
              </Text>
              <Text style={[styles.address, {}]}>{initialInvoice.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheet}
      >
        <BottomSheetScrollView
          style={{
            padding: 20,
          }}
        >
          {modalType === 'OPTIONS' && (
            <>
              <TouchableOpacity
                onPress={async () => {
                  bottomSheetRef.current?.close();
                  await shareViaLink();
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <ShareLinkIcon />
                  <Text style={styles.optionsTitle}>Share via link</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalType('E-MAIL');
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <ShareEmailIcon />
                  <Text style={styles.optionsTitle}>Share via email</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current?.close();
                  navigate('EditInvoice', initialInvoice);
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <EditIcon />
                  <Text style={styles.optionsTitle}>Edit Invoice</Text>
                </View>
              </TouchableOpacity>
              {initialInvoice?.status === 'paid' ? (
                <TouchableOpacity
                  onPress={async () => {
                    setModalType('MARK_AS');
                  }}
                  style={styles.optionsContainer}
                >
                  <View style={styles.sortTextContainer}>
                    <UnpaidIcon />
                    <Text style={styles.optionsTitle}>Mark as Unpaid</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={async () => {
                    setModalType('MARK_AS');
                  }}
                  style={styles.optionsContainer}
                >
                  <View style={styles.sortTextContainer}>
                    <CheckMarkIcon />
                    <Text style={styles.optionsTitle}>Mark as Paid</Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          )}

          {modalType === 'MARK_AS' && (
            <>
              <Text
                style={[
                  styles.heading,
                  {
                    marginBottom: 20,
                    textAlign: 'center',
                    textTransform: 'none',
                  },
                ]}
              >
                Are you sure you want to mark this invoice as{' '}
                {initialInvoice?.status === 'paid' ? 'unpaid' : 'paid'}?
              </Text>
              <InvoiceRow invoice={initialInvoice} />
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  {
                    marginBottom: 20,
                    backgroundColor:
                      initialInvoice?.status === 'pending'
                        ? '#16a34a'
                        : '#ca8a04',
                  },
                ]}
                onPress={async () => {
                  if (initialInvoice?.status === 'pending') {
                    await updateStatus('paid');
                  } else {
                    await updateStatus('unpaid');
                  }
                  bottomSheetRef.current?.close();
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                  }}
                >
                  Yes mark as{' '}
                  {initialInvoice?.status === 'paid' ? 'unpaid' : 'paid'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current?.close();
                }}
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: undefined,
                    borderWidth: 1,
                    borderColor: theme.colors.grey.light,
                  },
                ]}
              >
                <Text>No Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          {modalType === 'E-MAIL' && (
            <>
              <View style={styles.formInput}>
                <Text style={styles.label}>Email</Text>
                <BottomSheetTextInput
                  placeholderTextColor="#999"
                  style={styles.inputContainer}
                  placeholder="Enter email address"
                  keyboardType={'email-address'}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={styles.formInput}>
                <Text style={styles.label}>Subject</Text>
                <BottomSheetTextInput
                  placeholderTextColor="#999"
                  style={styles.inputContainer}
                  value={subject}
                  placeholder="Enter email subject"
                  onChangeText={setSubject}
                />
              </View>
              <View style={styles.formInput}>
                <Text style={styles.label}>Message (Optional)</Text>
                <BottomSheetTextInput
                  placeholderTextColor="#999"
                  style={[
                    styles.inputContainer,
                    {
                      height: 100,
                      textAlignVertical: 'top',
                      paddingTop: 10,
                      marginBottom: 20,
                    },
                  ]}
                  value={message}
                  multiline
                  numberOfLines={5}
                  placeholder="Enter email subject"
                  onChangeText={setMessage}
                />
                <ButtonComponent
                  title={'Send Email '}
                  onPress={sendEmail}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
};

export default InvoiceDetailsScreen;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    invoiceNo: {
      fontFamily: theme.font.medium,
      fontSize: 16,
      color: theme.colors.text.dark,
      marginBottom: 5,
    },
    address: {
      fontFamily: theme.font.medium,
      fontSize: 15,
      color: theme.colors.text.dark,
    },
    invoiceSubText: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.dark,
      fontSize: 16,
      marginRight: 5,
    },
    invoiceSubTextValue: {
      fontFamily: theme.font.semibold,
      color: theme.colors.text.primary,
      fontSize: 16,
    },
    bodyPadding: {
      padding: 14,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.grey.light,
    },

    invoiceAmount: {
      fontFamily: theme.font.bold,
      fontSize: 28,
      color: '#6dbe23',
    },
    logoContainer: {
      marginTop: 12,
      width: 150,
      aspectRatio: 1,
    },
    logo: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    logoText: {
      fontFamily: theme.font.bold,
      marginTop: 10,
      fontSize: 28,
      color: theme.colors.text.primary,
    },

    container: {
      marginTop: 30,
      borderWidth: 1,
      paddingBottom: 20,
      backgroundColor: '#fff',
      borderColor: theme.colors.grey.light,
    },
    stripe: {
      height: 16,
      width: '100%',
      backgroundColor: '#8ede45',
    },

    label: {
      fontFamily: theme.font.medium,
      fontSize: 13,
      textTransform: 'capitalize',
      marginBottom: theme.spacing.xs,
      color: theme.colors.text.primary,
    },
    formInput: {
      marginBottom: theme.spacing.sm,
    },
    inputContainer: {
      paddingVertical: theme.spacing.xxxs,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderRadius: 14,
      fontFamily: theme.font.medium,
      borderColor: theme.colors.grey.light,
      backgroundColor: '#F8F9FD',
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 50,
    },

    bottomSheet: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
    },

    optionsContainer: {
      backgroundColor: '#F8F9FD',
      borderRadius: 15,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    sortTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    optionsTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      marginLeft: theme.spacing.md,
    },

    primaryBtn: {
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.text.main,
      paddingVertical: 10,
      paddingHorizontal: 14,
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
    iconBtn: {
      backgroundColor: '#fff',
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
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
  }),
);
