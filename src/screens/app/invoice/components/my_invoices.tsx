import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { styleSheetFactory, theme, useTheme } from '../../../../theme';
import { TouchableOpacity } from 'react-native-gesture-handler';
import InvoiceCards from './invoice_cards';
import { DotsIcon } from '../../../../assets/svg/dots';
import React, { useMemo, useRef, useState } from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import useInvoice from '../../../../hooks/use_invoice';
import EmptyInvoice from './empty_invoice';
import InvoiceRow from './invoice_row';
import { Invoice } from '../../../../entities/invoice';
import { DuplicateIcon } from '../../../../assets/svg/duplicate';
import { DeleteIcon } from '../../../../assets/svg/delete';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from '../../../../navigation/navigator';
import ClientsIcon from '../../../../assets/svg/clients';
import ExportIcon from '../../../../assets/svg/export';
import Toast from 'react-native-toast-message';
import { calculateBalanceDue } from '../../../../utils/balance_due';
import { currencyFormatter } from '../../../../utils/currency';
import { formatTimestamp, isBeforeToday } from '../../../../utils/date';
import RNFS from 'react-native-fs';
import { convertToCSV } from '../../../../utils/convert_to_csv';
import Share from 'react-native-share';
import CheckMarkIcon from '../../../../assets/svg/checkmark';
import UnpaidIcon from '../../../../assets/svg/unpaid';
import EditIcon from '../../../../assets/svg/edit';
import ViewIcon from '../../../../assets/svg/View';
import { ShareIcon } from '../../../../assets/svg/share';
import useSubscription from '../../../../hooks/use_subscription';
import ButtonComponent from '../../../../components/button/button-component';

const MyInvoices = () => {
  const [styles] = useTheme(Styles);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [modalType, setModalType] = useState<
    'OPTIONS' | 'INVOICE_DETAILS' | 'DELETE' | 'MARK_AS'
  >('OPTIONS');
  const {
    invoices,
    markAsPaid,
    markAsUnpaid,
    duplicate,
    delete: deleteInvoiceById,
  } = useInvoice();
  const [selectedInvoice, setSelectedInvoice] = useState<null | Invoice>(null);
  const { subscription } = useSubscription();
  const subscriptionSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => {
    if (modalType === 'INVOICE_DETAILS') {
      return [680];
    }
    if (modalType === 'OPTIONS') {
      return [220];
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
  const getStatus = (invoice: Invoice) => {
    if (invoice.status === 'paid') {
      return 'paid';
    }
    if (isBeforeToday(invoice.dueAt)) {
      return 'overdue';
    }
    return 'pending';
  };

  const exportInvoices = async () => {
    if (!invoices || invoices.length === 0) {
      return Toast.show({
        type: 'error',
        text1: 'Please add an invoice first',
        text2: 'No invoices found',
      });
    }
    const data = invoices!.map(item => {
      return {
        INVOICENUMBER: item.number,
        CLIENT: item.customer.name,
        DUEDATE: formatTimestamp(item.dueAt),
        STATUS: getStatus(item),
        TOTAL: currencyFormatter(item.currency).format(
          calculateBalanceDue(item),
        ),
      };
    });
    try {
      const fileName = `receipts-${Math.floor(Math.random() * 9000) + 1000}`;
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}.csv`;
      const csv = convertToCSV(data);
      await RNFS.writeFile(filePath, csv, 'utf8');
      await Share.open({
        url: `file://${filePath}`,
        filename: fileName,
        type: 'text/csv',
        saveToFiles: true,

        showAppsToView: true,
      });
    } catch (error) {
      if (error.message === 'CANCELLED') return;
      Toast.show({
        type: 'error',
        text1: 'Error exporting Receipts',
        text2: error,
      });
      console.log(error);
    }
  };

  const updateStatus = async (status: 'paid' | 'unpaid') => {
    if (!selectedInvoice) {
      return Toast.show({
        type: 'error',
        text1: 'Please select an invoice first',
        text2: 'No invoice selected',
      });
    }
    try {
      if (status === 'paid') {
        await markAsPaid(selectedInvoice.id);
      } else if (status === 'unpaid') {
        await markAsUnpaid(selectedInvoice.id);
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

  const duplicateInvoice = async () => {
    if (!selectedInvoice) {
      return Toast.show({
        type: 'error',
        text1: 'Please select an invoice first',
        text2: 'No invoice selected',
      });
    }
    try {
      const results = await duplicate(selectedInvoice);
      navigate('InvoiceDetails', results);
      Toast.show({
        type: 'success',
        text1: `Invoice duplicated successfully`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error duplicating invoice',
      });
    }
  };

  const downloadInvoice = async () => {
    if (!selectedInvoice) {
      return Toast.show({
        type: 'error',
        text1: 'Please select an invoice first',
        text2: 'No invoice selected',
      });
    }
    try {
      const url = `https://application.proceipt.com/download/invoices/${selectedInvoice.id}?download=true`;
      await Linking.openURL(url);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error downloading invoice',
      });
    }
  };

  const deleteInvoice = async () => {
    if (!selectedInvoice) {
      return Toast.show({
        type: 'error',
        text1: 'Please select an invoice first',
        text2: 'No invoice selected',
      });
    }
    try {
      await deleteInvoiceById(selectedInvoice.id);
      Toast.show({
        type: 'success',
        text1: `Invoice deleted successfully`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error deleting invoice',
      });
    }
  };
  const shareViaLink = async () => {
    if (!selectedInvoice) {
      return Toast.show({
        type: 'error',
        text1: 'Please select an invoice first',
        text2: 'No invoice selected',
      });
    }
    const url = `https://application.proceipt.com/download/invoices/${selectedInvoice.id}`;
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

  return (
    <>
      <Text style={styles.instructionText}>
        All your paid, pending, and overdue invoices. You can mark an invoice as
        paid when your customer pays, to get the true picture for your financial
        position.
      </Text>
      <InvoiceCards />
      <View
        style={{
          marginVertical: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={styles.heading}>Recent Invoices</Text>
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

      {invoices ? (
        <>
          {invoices.length > 0 ? (
            <View
              style={{
                flex: 1,
                marginBottom: 30,
              }}
            >
              {invoices.map(invoice => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  onPress={() => {
                    setSelectedInvoice(invoice);
                    setModalType('INVOICE_DETAILS');
                    bottomSheetRef.current?.present();
                  }}
                />
              ))}
            </View>
          ) : (
            <EmptyInvoice />
          )}
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}

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
                onPress={() => {
                  bottomSheetRef.current?.close();
                  navigate('Clients');
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <ClientsIcon />
                  <Text style={styles.optionsTitle}>My Clients</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  bottomSheetRef.current?.close();
                  exportInvoices();
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <ExportIcon />
                  <Text style={styles.optionsTitle}>Export Invoices</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
          {modalType === 'INVOICE_DETAILS' && (
            <>
              <InvoiceRow invoice={selectedInvoice!} />

              <TouchableOpacity
                onPress={() => {
                  if (!selectedInvoice) return;
                  bottomSheetRef.current?.close();
                  navigate('InvoiceDetails', selectedInvoice);
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <ViewIcon />
                  <Text style={styles.optionsTitle}>View Invoice</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await downloadInvoice();
                  bottomSheetRef.current?.close();
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <ExportIcon />
                  <Text style={styles.optionsTitle}>Download Invoice</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  shareViaLink();
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <ShareIcon />
                  <Text style={styles.optionsTitle}>Share Invoice</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!selectedInvoice) return;
                  bottomSheetRef.current?.close();
                  if (!subscription?.active) {
                    return subscriptionSheetRef.current?.present();
                  }
                  navigate('EditInvoice', selectedInvoice);
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <EditIcon />
                  <Text style={styles.optionsTitle}>Edit Invoice</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await duplicateInvoice();
                  bottomSheetRef.current?.close();
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <DuplicateIcon />
                  <Text style={styles.optionsTitle}>Duplicate Invoice</Text>
                </View>
              </TouchableOpacity>
              {selectedInvoice?.status === 'paid' ? (
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
              <TouchableOpacity
                onPress={() => {
                  setModalType('DELETE');
                }}
                style={styles.optionsContainer}
              >
                <View style={styles.sortTextContainer}>
                  <DeleteIcon />
                  <Text style={styles.optionsTitle}>Delete Invoice</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {modalType === 'DELETE' && (
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
                Are you sure you want to delete this invoice?
              </Text>
              <InvoiceRow invoice={selectedInvoice!} />
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginBottom: 20, backgroundColor: '#FF0000' },
                ]}
                onPress={async () => {
                  await deleteInvoice();
                  bottomSheetRef.current?.close();
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                  }}
                >
                  Yes Delete
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
                {selectedInvoice?.status === 'paid' ? 'unpaid' : 'paid'}?
              </Text>
              <InvoiceRow invoice={selectedInvoice!} />
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  {
                    marginBottom: 20,
                    backgroundColor:
                      selectedInvoice?.status === 'pending'
                        ? '#16a34a'
                        : '#ca8a04',
                  },
                ]}
                onPress={async () => {
                  if (selectedInvoice?.status === 'pending') {
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
                  {selectedInvoice?.status === 'paid' ? 'unpaid' : 'paid'}
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
        </BottomSheetScrollView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={subscriptionSheetRef}
        snapPoints={[300]}
        index={0}
        backdropComponent={renderBackdrop}
        style={styles.bottomSheet}
      >
        <BottomSheetScrollView
          style={{
            padding: 20,
          }}
        >
          <Text
            style={[styles.heading, { textAlign: 'center', marginBottom: 10 }]}
          >
            Upgrade Your Plan
          </Text>
          <Text style={styles.subText}>
            Oh no! It looks like your free trial has ended or your subscription
            is no longer active. Don't worry, you can continue enjoying all the
            amazing features Proceipt offers by upgrading or starting a
            subscription today.
          </Text>
          <ButtonComponent
            title={'Check Pricing'}
            onPress={() => {
              bottomSheetRef.current?.dismiss();
              navigate('Billing', {});
            }}
          />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
};

export default MyInvoices;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    subText: {
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
      fontSize: 15,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
    },
    instructionText: {
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
      fontSize: 15,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
    },
    bottomSheet: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
    },
    heading: {
      fontFamily: theme.font.semibold,
      fontSize: 18,
      color: theme.colors.text.main,
      textTransform: 'capitalize',
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
    iconBtn: {
      backgroundColor: '#fff',
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    primaryBtn: {
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.text.main,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
  }),
);
