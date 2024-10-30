import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InvoiceFeatureAppbar from '../components/invoice_feature_appbar';
import React, { useRef, useState } from 'react';
import { styleSheetFactory, theme, useTheme } from '../../../../theme';
import DatePicker from 'react-native-date-picker';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { SelectCustomer } from '../components/select_customer';
import { Customer } from '../../../../entities/customer';
import EditIcon from '../../../../assets/svg/edit';
import CreateCustomerBottomSheet from '../components/create_customer_bottom_sheet';
import useInvoice from '../../../../hooks/use_invoice';
import { SelectInvoiceItem } from '../components/invoice_items_bottom_sheet';
import {
  InvoiceItem,
  InvoiceItemWithQuantity,
} from '../../../../entities/invoice_item';
import Toast from 'react-native-toast-message';
import useInvoiceItem from '../../../../hooks/use_invoice_item';
import CreateInvoiceItemBottomSheet from '../components/create_invoice_item_bottom_sheet';
import { DeleteIcon } from '../../../../assets/svg/delete';
import CloseIcon from '../../../../assets/svg/close';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CurrencyList } from '../../../../components/currency/currency-list';
import ChangeIcon from '../../../../assets/svg/change';
import { Discount } from '../../../../entities/discount';
import { Tax } from '../../../../entities/tax';
import PlusIcon from '../../../../assets/svg/plus';
import SwapIcon from '../../../../assets/svg/swap';
import { currencyFormatter } from '../../../../utils/currency';
import ButtonComponent from '../../../../components/button/button-component';
import { Invoice } from '../../../../entities/invoice';
import uuid from 'react-native-uuid';
import useOrganisation from '../../../../hooks/use_organisation';
import {
  NavigationProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParameterList } from '../../../../navigation/navigator';
import firestore from '@react-native-firebase/firestore';

const CreateInvoiceScreen = () => {
  const insets = useSafeAreaInsets();
  const { organisation } = useOrganisation();
  const [styles] = useTheme(Styles);
  const [issuedAt, setIssuedAt] = useState<Date>();
  const [dueAt, setDueAt] = useState<Date>();
  const { invoices, create } = useInvoice();
  const { deleteInvoiceItem } = useInvoiceItem();
  const { dispatch } = useNavigation<NavigationProp<RootStackParameterList>>();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemWithQuantity[]>(
    [],
  );

  const [selectedInvoiceItemToDelete, setSelectedInvoiceItemToDelete] =
    useState<InvoiceItem>();

  const [currency, setCurrency] = useState('GBP');
  const [description, setDescription] = useState('');

  const [invoiceNumber, setInvoiceNumber] = useState(
    `invoice-${(invoices?.length ?? 0) + 1}`,
  );
  const [hasDiscount, setHasDiscount] = useState(false);
  const [hasTax, setHasTax] = useState(false);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState<Discount>({
    value: 0,
    type: 'percentage',
  });
  const [tax, setTax] = useState<Tax>({
    value: 0,
    type: 'percentage',
  });

  const [loading, setLoading] = useState(false);

  const customersBottomSheetRef = useRef<BottomSheetModal>(null);
  const deleteInvoiceBottomSheetRef = useRef<BottomSheetModal>(null);
  const createCustomerBottomSheetRef = useRef<BottomSheetModal>(null);
  const createInvoiceItemBottomSheetRef = useRef<BottomSheetModal>(null);
  const invoiceItemsBottomSheetRef = useRef<BottomSheetModal>(null);
  const currencyBottomSheetRef = useRef<BottomSheetModal>(null);
  const [isDatePickerOpened, setIsDatePickerOpened] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'issuedAt' | 'dueAt'>(
    'issuedAt',
  );
  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };
  const deleteSelectedInvoiceItem = async () => {
    try {
      if (!selectedInvoiceItemToDelete) {
        return Toast.show({
          type: 'error',
          text1: 'Please select an invoice item first',
          text2: 'No invoice item selected',
        });
      }
      await deleteInvoiceItem(selectedInvoiceItemToDelete.id);
      Toast.show({
        type: 'success',
        text1: `Invoice item deleted successfully`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'We could not delete invoice item',
        text2: 'Something went wrong',
      });
    }
  };

  const removeInvoiceItem = (index: number) => {
    const newInvoiceItems = [...invoiceItems];
    newInvoiceItems.splice(index, 1);
    setInvoiceItems(newInvoiceItems);
  };

  const subTotal = invoiceItems.reduce(
    (total, item) =>
      total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );

  const calculateBalanceDue = () => {
    let result = subTotal;
    if (hasDiscount) {
      if (discount.type === 'fixed') {
        const minDiscount = Math.min(discount.value || 0, subTotal);
        result -= minDiscount;
      } else {
        result -= (subTotal * (discount.value || 0)) / 100;
      }
    }
    if (hasTax) {
      if (tax.type === 'fixed') {
        const minTax = Math.min(tax.value || 0, subTotal);
        result += minTax;
      } else {
        result += (subTotal * (tax.value || 0)) / 100;
      }
    }
    return result;
  };
  const clearTax = () => {
    setHasTax(false);
    setTax({ type: 'percentage', value: 0 });
  };

  const clearDiscount = () => {
    setHasDiscount(false);
    setDiscount({ type: 'percentage', value: 0 });
  };
  const saveInvoice = async () => {
    if (!selectedCustomer) {
      return Toast.show({
        type: 'error',
        text1: 'Please select a customer first',
        text2: 'No customer selected',
      });
    }
    if (!issuedAt) {
      return Toast.show({
        type: 'error',
        text1: 'Please select an issued date first',
        text2: 'No date selected',
      });
    }
    if (!dueAt) {
      return Toast.show({
        type: 'error',
        text1: 'Please select a due date first',
        text2: 'No date selected',
      });
    }
    if (invoiceItems.length === 0) {
      return Toast.show({
        type: 'error',
        text1: 'Please add an invoice item first',
        text2: 'No invoice item added',
      });
    }

    const invoice: Invoice = {
      id: uuid.v4() as string,
      number: invoiceNumber || `invoice-${invoices!.length + 1}`,
      createdAt: firestore.Timestamp.now(),
      tax: hasTax ? tax : null,
      discount: hasDiscount ? discount : null,
      updatedAt: null,
      status: 'pending',
      description: description.trim(),
      issuedAt: firestore.Timestamp.fromDate(issuedAt),
      dueAt: firestore.Timestamp.fromDate(dueAt),
      customer: selectedCustomer,
      items: invoiceItems,
      organisationId: organisation!.id,
      reminders: [],
      currency,
      userId: organisation!.userId,
      notes,
    };
    try {
      setLoading(true);
      await create(invoice);
      Toast.show({
        type: 'success',
        text1: 'Invoice created successfully',
      });
      dispatch(StackActions.replace('InvoiceDetails', invoice));
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'We could not create invoice',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetModalProvider>
      <View
        style={{
          flex: 1,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <DatePicker
          theme={'light'}
          modal
          open={isDatePickerOpened}
          date={new Date()}
          onConfirm={date => {
            setIsDatePickerOpened(false);
            if (datePickerType === 'issuedAt') {
              setIssuedAt(date);
            } else {
              setDueAt(date);
            }
          }}
          onCancel={() => {
            setIsDatePickerOpened(false);
          }}
        />
        <InvoiceFeatureAppbar
          title={'Create an invoice'}
          buttonText={loading ? 'Saving...' : 'Save Invoice'}
          showBack
          onPress={() => {
            if (loading) return;
            saveInvoice();
          }}
        />
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          extraScrollHeight={55}
          style={{
            paddingHorizontal: '5%',
            paddingBottom: 20,
          }}
        >
          <Text style={styles.instructionText}>
            Your organisation's info is added automatically
          </Text>
          <View style={styles.formInput}>
            <Text style={styles.label}>Select / Add Customer</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => {
                customersBottomSheetRef.current?.present();
              }}
            >
              {!selectedCustomer ? (
                <Text>Tap to select or create a customer</Text>
              ) : (
                <View
                  style={{
                    paddingVertical: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedCustomerName}>
                      {selectedCustomer.name}
                    </Text>
                    {selectedCustomer.email && (
                      <Text style={styles.selectedCustomerEmail}>
                        {selectedCustomer.email}
                      </Text>
                    )}
                  </View>
                  <EditIcon />
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.formInput}>
            <Text style={styles.label}>Invoice Number</Text>
            <TextInput
              placeholder={'invoice-1'}
              style={styles.inputContainer}
              value={invoiceNumber}
              onChangeText={setInvoiceNumber}
            />
          </View>
          <View style={styles.formInput}>
            <Text style={styles.label}>Invoice Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={"What's the invoice about? (max 100 characters)"}
              style={styles.inputContainer}
              maxLength={100}
            />
          </View>
          <View style={styles.formInput}>
            <Text style={styles.label}>Issued On</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => {
                setDatePickerType('issuedAt');
                setIsDatePickerOpened(true);
              }}
            >
              {!issuedAt ? (
                <Text>Select a date</Text>
              ) : (
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: theme.font.medium,
                  }}
                >
                  {issuedAt.toDateString()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.formInput}>
            <Text style={styles.label}>Due date</Text>
            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => {
                setDatePickerType('dueAt');
                setIsDatePickerOpened(true);
              }}
            >
              {!dueAt ? (
                <Text>Select a date</Text>
              ) : (
                <Text
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: theme.font.medium,
                  }}
                >
                  {dueAt.toDateString()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Invoice Items</Text>
          <View>
            {invoiceItems.map((item, index) => {
              const calculatedPrice =
                parseFloat(item.price.toString()) *
                parseFloat(item.quantity.toString());
              const amount = isNaN(calculatedPrice)
                ? 0
                : calculatedPrice.toFixed(2);
              return (
                <View key={index} style={styles.invoiceItemCard}>
                  <TouchableOpacity
                    style={[styles.iconBtn, { alignSelf: 'flex-end' }]}
                    onPress={() => removeInvoiceItem(index)}
                  >
                    <DeleteIcon />
                  </TouchableOpacity>
                  <Text style={styles.invoiceItemName}>{item.name}</Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ width: '46%', position: 'relative' }}>
                      <Text style={styles.invoiceItemCurrency}>{currency}</Text>
                      <TextInput
                        placeholder={'price'}
                        keyboardType={'numeric'}
                        value={item.price.toString()}
                        textAlign={'right'}
                        onChangeText={text => {
                          const newInvoiceItems = [...invoiceItems];
                          newInvoiceItems[index].price = parseFloat(text) || 0;
                          setInvoiceItems(newInvoiceItems);
                        }}
                        style={[
                          styles.inputContainer,
                          {
                            paddingLeft: 43,
                          },
                        ]}
                      />
                    </View>
                    <CloseIcon color={'#000'} />
                    <TextInput
                      placeholder={'quantity'}
                      value={item.quantity.toString()}
                      keyboardType={'numeric'}
                      onChangeText={text => {
                        const newInvoiceItems = [...invoiceItems];
                        newInvoiceItems[index].quantity = parseInt(text) || 0;
                        setInvoiceItems(newInvoiceItems);
                      }}
                      style={[
                        styles.inputContainer,
                        {
                          width: '46%',

                          borderColor:
                            item.quantity === 0
                              ? theme.colors.error.primary
                              : theme.colors.grey.light,
                        },
                      ]}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: theme.font.semibold,
                        marginRight: 5,
                      }}
                    >
                      AMOUNT:
                    </Text>

                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: theme.font.semibold,
                        color: theme.colors.text.primary,
                      }}
                    >
                      {currency} {amount}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.formInput}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => {
                invoiceItemsBottomSheetRef.current?.present();
              }}
            >
              <Text
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: theme.font.medium,
                }}
              >
                Add invoice item
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              alignItems: 'flex-end',
              marginTop: theme.spacing.md,
            }}
          >
            <View style={[styles.subComponents, { marginBottom: 15 }]}>
              <Text style={styles.currencyText}>Currency</Text>
              <TouchableOpacity
                style={styles.currencyBtn}
                onPress={() => {
                  currencyBottomSheetRef?.current?.present();
                }}
              >
                <Text style={styles.currencyBtnText}>{currency}</Text>
                <ChangeIcon />
              </TouchableOpacity>
            </View>
            <View style={styles.subComponents}>
              <Text style={[styles.currencyText]}>Sub total</Text>
              <Text style={styles.subTotalValue}>
                {currencyFormatter(currency).format(subTotal)}
              </Text>
            </View>
            {hasDiscount && (
              <View style={styles.discountContainer}>
                <TouchableOpacity
                  style={{
                    marginRight: 4,
                  }}
                  onPress={clearDiscount}
                >
                  <CloseIcon width={22} height={22} />
                </TouchableOpacity>
                <Text style={styles.currencyText}>Discount</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={discount.value.toString()}
                    keyboardType={'numeric'}
                    onChangeText={text => {
                      const maxValue =
                        discount.type === 'fixed' ? subTotal : 100;
                      const value = parseFloat(text) || 0;
                      setDiscount({
                        ...discount,
                        value: Math.min(value, maxValue),
                      });
                    }}
                    style={[
                      styles.inputContainer,
                      {
                        textAlign: discount.type === 'fixed' ? 'left' : 'right',
                        minHeight: 40,
                        minWidth: 140,
                        borderColor: theme.colors.grey.light,
                        paddingRight: 55,
                        paddingLeft: discount.type === 'fixed' ? 40 : undefined,
                      },
                    ]}
                  />
                  <TouchableOpacity
                    style={styles.swapIconBtn}
                    onPress={() => {
                      setDiscount({
                        type:
                          discount.type === 'fixed' ? 'percentage' : 'fixed',
                        value: 0,
                      });
                    }}
                  >
                    <SwapIcon width={20} height={20} />
                  </TouchableOpacity>
                  {discount.type === 'fixed' ? (
                    <Text style={styles.discountFixedSymbol}>{currency}</Text>
                  ) : (
                    <Text style={styles.discountPercentSymbol}>%</Text>
                  )}
                </View>
              </View>
            )}
            {hasTax && (
              <View style={styles.discountContainer}>
                <TouchableOpacity
                  style={{
                    marginRight: 4,
                  }}
                  onPress={clearTax}
                >
                  <CloseIcon width={22} height={22} />
                </TouchableOpacity>
                <Text style={styles.currencyText}>Tax</Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={tax.value.toString()}
                    keyboardType={'numeric'}
                    onChangeText={text => {
                      const maxValue = tax.type === 'fixed' ? subTotal : 100;
                      const value = parseFloat(text) || 0;
                      setTax({
                        ...tax,
                        value: Math.min(value, maxValue),
                      });
                    }}
                    style={[
                      styles.inputContainer,
                      {
                        textAlign: tax.type === 'fixed' ? 'left' : 'right',
                        minHeight: 40,
                        minWidth: 140,
                        borderColor: theme.colors.grey.light,
                        paddingRight: 55,
                        paddingLeft: tax.type === 'fixed' ? 40 : undefined,
                      },
                    ]}
                  />
                  <TouchableOpacity
                    style={styles.swapIconBtn}
                    onPress={() => {
                      setTax({
                        type: tax.type === 'fixed' ? 'percentage' : 'fixed',
                        value: 0,
                      });
                    }}
                  >
                    <SwapIcon width={20} height={20} />
                  </TouchableOpacity>
                  {tax.type === 'fixed' ? (
                    <Text style={styles.discountFixedSymbol}>{currency}</Text>
                  ) : (
                    <Text style={styles.discountPercentSymbol}>%</Text>
                  )}
                </View>
              </View>
            )}

            <View style={[styles.subComponents, { marginTop: 15 }]}>
              {!hasDiscount && (
                <TouchableOpacity
                  style={[styles.chipBtn, { marginRight: 10 }]}
                  onPress={() => setHasDiscount(true)}
                >
                  <PlusIcon />
                  <Text style={styles.chipBtnText}>Discount</Text>
                </TouchableOpacity>
              )}
              {!hasTax && (
                <TouchableOpacity
                  style={styles.chipBtn}
                  onPress={() => setHasTax(true)}
                >
                  <PlusIcon />
                  <Text style={styles.chipBtnText}>Tax</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.subComponents, { marginVertical: 15 }]}>
              <Text style={[styles.currencyText]}>Balance Due</Text>
              <Text
                style={[
                  styles.subTotalValue,
                  { fontSize: 18, color: '#6ead33' },
                ]}
              >
                {currencyFormatter(currency).format(calculateBalanceDue())}
              </Text>
            </View>
          </View>
          <View style={styles.formInput}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              placeholder={
                'Notes - any relevant information not already covered'
              }
              style={[
                styles.inputContainer,
                {
                  textAlignVertical: 'top',
                  height: 120,
                  paddingTop: 10,
                },
              ]}
              value={notes}
              multiline
              onChangeText={setNotes}
            />
          </View>
          <ButtonComponent
            title={'Create Invoice'}
            onPress={saveInvoice}
            loading={loading}
            disabled={loading}
          />
        </KeyboardAwareScrollView>
      </View>

      <BottomSheetModal
        ref={customersBottomSheetRef}
        snapPoints={['80%']}
        animateOnMount={true}
        backdropComponent={renderBackdrop}
      >
        <SelectCustomer
          onItemPress={item => {
            setSelectedCustomer(item);
            customersBottomSheetRef.current?.dismiss();
          }}
          onCreateCustomerPress={name => {
            customersBottomSheetRef.current?.dismiss();
            createCustomerBottomSheetRef.current?.present();
          }}
        />
      </BottomSheetModal>
      <BottomSheetModal
        ref={invoiceItemsBottomSheetRef}
        snapPoints={['80%']}
        animateOnMount={true}
        backdropComponent={renderBackdrop}
      >
        <SelectInvoiceItem
          onItemPress={item => {
            const itemWithQty: InvoiceItemWithQuantity = {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: 1,
            };
            setInvoiceItems([...invoiceItems, itemWithQty]);
            invoiceItemsBottomSheetRef.current?.dismiss();
          }}
          onInvoiceItemDeletePress={item => {
            setSelectedInvoiceItemToDelete(item);
            invoiceItemsBottomSheetRef.current?.dismiss();
            deleteInvoiceBottomSheetRef.current?.present();
          }}
          onCreateInvoiceItemPress={name => {
            invoiceItemsBottomSheetRef.current?.dismiss();
            createInvoiceItemBottomSheetRef.current?.present();
          }}
        />
      </BottomSheetModal>
      <BottomSheetModal
        ref={createCustomerBottomSheetRef}
        snapPoints={['90%']}
        animateOnMount={true}
        backdropComponent={renderBackdrop}
      >
        <CreateCustomerBottomSheet
          onSuccess={customer => {
            setSelectedCustomer(customer);
            createCustomerBottomSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetModal>
      <BottomSheetModal
        ref={createInvoiceItemBottomSheetRef}
        snapPoints={['70%']}
        animateOnMount={true}
        backdropComponent={renderBackdrop}
      >
        <CreateInvoiceItemBottomSheet
          onSuccess={item => {
            const itemWithQty: InvoiceItemWithQuantity = {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: 1,
            };
            setInvoiceItems([...invoiceItems, itemWithQty]);
            createInvoiceItemBottomSheetRef.current?.dismiss();
          }}
        />
      </BottomSheetModal>
      <BottomSheetModal
        ref={deleteInvoiceBottomSheetRef}
        snapPoints={[250]}
        style={{
          padding: 20,
        }}
        animateOnMount={true}
        backdropComponent={renderBackdrop}
      >
        <Text
          style={[
            styles.heading,
            {
              marginBottom: 20,
              textAlign: 'center',
              textTransform: 'none',
            },
          ]}
          numberOfLines={3}
        >
          Are you sure you want to delete "{selectedInvoiceItemToDelete?.name}"
          ?
        </Text>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { marginBottom: 20, backgroundColor: '#FF0000' },
          ]}
          onPress={async () => {
            await deleteSelectedInvoiceItem();
            deleteInvoiceBottomSheetRef.current?.close();
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
            setSelectedInvoiceItemToDelete(undefined);
            deleteInvoiceBottomSheetRef.current?.close();
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
      </BottomSheetModal>
      <BottomSheetModal
        ref={currencyBottomSheetRef}
        snapPoints={['75%']}
        animateOnMount={true}
        backdropComponent={renderBackdrop}
      >
        <CurrencyList
          onItemPress={item => {
            setCurrency(item.currency);
            currencyBottomSheetRef?.current?.close();
          }}
        />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default CreateInvoiceScreen;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    swapIconBtn: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: [{ translateY: -10 }],
    },

    discountContainer: {
      flexDirection: 'row',
      marginTop: 10,
      alignItems: 'center',
    },
    discountPercentSymbol: {
      position: 'absolute',
      right: 40,
      top: '50%',
      transform: [{ translateY: -10 }],
      fontFamily: theme.font.medium,
    },
    discountFixedSymbol: {
      position: 'absolute',
      right: 105,
      top: '50%',
      transform: [{ translateY: -8 }],
      fontFamily: theme.font.medium,
    },

    subComponents: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'flex-end',
    },

    chipBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: theme.colors.grey.dark,
      borderWidth: 1,
      paddingHorizontal: 20,
      paddingVertical: 6,
      borderRadius: 999,
    },
    chipBtnText: {
      fontSize: 14,
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
    },

    invoiceItemCard: {
      padding: 5,
      paddingHorizontal: 10,
      paddingBottom: 12,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: theme.colors.grey.light,
      marginBottom: 14,
      borderRadius: 12,
    },
    invoiceItemName: {
      fontFamily: theme.font.medium,
      fontSize: 16,
      color: theme.colors.text.primary,
      marginBottom: 10,
    },
    invoiceItemCurrency: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: [{ translateY: -10 }],
      zIndex: 999,
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
    },
    currencyText: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.darkGrey,
      fontSize: 16,
      marginRight: 25,
    },
    subTotalValue: {
      minWidth: 75,
      textAlign: 'right',
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
      fontSize: 16,
    },
    currencyBtn: {
      borderWidth: 1,
      borderColor: theme.colors.grey.dark,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    currencyBtnText: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
      fontSize: 14,
      marginRight: 6,
    },

    label: {
      fontFamily: theme.font.medium,
      fontSize: 13,
      textTransform: 'capitalize',
      marginBottom: theme.spacing.xs,
      color: theme.colors.text.primary,
    },
    instructionText: {
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
      fontSize: 15,
      marginVertical: theme.spacing.md,
    },
    selectedCustomerName: {
      fontFamily: theme.font.semibold,
      fontSize: 15,
      color: '#000',
      marginBottom: 2,
    },
    selectedCustomerEmail: {
      fontFamily: theme.font.regular,
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
    heading: {
      fontFamily: theme.font.semibold,
      fontSize: 18,
      color: theme.colors.text.main,
      textTransform: 'capitalize',
    },
    emptySubtitle: {
      color: theme.colors.text.dark,
      fontSize: 15,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    emptyTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      fontSize: 18,
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
      paddingVertical: 12,
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
      backgroundColor: theme.colors.grey.lighter,
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
  }),
);
