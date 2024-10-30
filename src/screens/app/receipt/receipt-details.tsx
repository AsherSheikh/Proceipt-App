import { ActivityIndicator, Dimensions, Image, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Pdf from 'react-native-pdf';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { styleSheetFactory, theme, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import ImageView from 'react-native-image-viewing';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParameterList } from 'navigation/navigator';
import { PenIcon } from 'assets/svg/pen-line';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { ReceiptIcon } from 'assets/svg/receipt';
import { toFormattedDate } from 'utils/date';
import { ItemDeleteIcon } from 'assets/svg/delete';
import DatePicker from 'react-native-date-picker';
import { useLazyReadReceiptQuery, useUpdateReceiptMutation } from 'features/receipt/receipt-reducer';
import { ShopIcon } from 'assets/svg/shop';
import { CurrencyList } from 'components/currency/currency-list';
import { getParamByParam } from 'iso-country-currency';
import firestore from '@react-native-firebase/firestore';
import { OrganisationFolder } from '../../../utils/type';
import { useSelector } from 'react-redux';
import { getUser } from '../../../features/profile/profile-reducer';
import { removeCurrencySymbol } from '../../../utils/currency-format';

export default function ReceiptDetailsScreen() {
  const [styles] = useTheme(Styles);

  const { goBack } = useNavigation<NavigationProp<RootStackParameterList>>();

  const {
    params: { receipt: details, folderId },
  } = useRoute<RouteProp<RootStackParameterList, 'ReceiptDetails'>>();

  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();

  const [fetchReceipt, { data }] = useLazyReadReceiptQuery();

  const [tempDetails, setTempDetails] = useState(details);

  const [updateReceipt, { isLoading, isSuccess }] = useUpdateReceiptMutation();

  const [show, setShow] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['75%'], []);
  const userData = useSelector(getUser);

  useEffect(() => {
    if (details?.id) {
      fetchReceipt(details.id);
    }
  }, [details, fetchReceipt]);

  const receipt = useMemo(() => {
    if (data) {
      return data;
    } else {
      return details;
    }
  }, [data, details]);

  useEffect(() => {
    if (isSuccess) {
      bottomSheetRef?.current?.close();
    }
  }, [isSuccess]);

  const currencyBottomSheetRef = useRef<BottomSheetModal>(null);

  const currencySnapPoints = useMemo(() => ['75%'], []);

  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };

  const update = async () => {
    if (folderId) {
      /// Receipt belongs to an organisation
      const folderRef = firestore().collection('folders-test').doc(folderId);
      try {
        // Get the folder document
        const folderDoc = await folderRef.get();

        // Get the receipts array from the folder document
        const folder = folderDoc.data() as OrganisationFolder;
        const receipts = folder.receipts;

        // Find the index of the oldReceipt object with the same ID as the newReceipt object
        const index = receipts.findIndex(value => value.id === tempDetails.id);

        // Replace the oldReceipt object with the newReceipt object
        const receiptWithUploadedAt = {
          ...tempDetails,
          uploadedAt: receipts[index].uploadedAt || new Date(),
        }
        if (index !== -1) {
          receipts[index] = receiptWithUploadedAt ;
        }

        // fix the uploadedAt field of the receipt document

        // Update the folder document with the new receipts array
        await folderRef.update({
          receipts: receipts,
        });
        navigate('AssignedFolderDetails', folder);
        console.log('Receipts updated successfully!');
      } catch (error) {
        console.error('Error updating receipts:', error);
      }
    } else {
      updateReceipt({ id: tempDetails.id, body: tempDetails });
    }
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onConfirmDateSelection = (date: Date) => {
    setShowDatePicker(false);
    setTempDetails({
      ...tempDetails,
      invoice_receipt_date: date.toDateString(),
    });
  };

  const onChangeCurrency = (currency: string) => {
    setTempDetails({ ...tempDetails, currency });
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Pressable
              // @ts-ignoreß
              onPress={goBack}
              style={styles.leftHeader}
            >
              <LeftArrow color="#000" />
            </Pressable>
            <Pressable
              onPress={() => bottomSheetRef.current?.present()}
              style={styles.leftHeader}
            >
              <PenIcon color="#000" />
            </Pressable>
          </View>
          <View>
            <Text style={styles.subheaderTitle}>{receipt.name}</Text>
            <Text style={styles.subheaderSubtitle}>P-ID: #{receipt.id}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollviewContent}
            style={styles.scrollview}
          >
            <View style={styles.metaContainer}>
              <View
                style={{
                  position: 'absolute',
                  top: -75,
                  right: -75,
                  width: 60,
                  height: 60,
                  transform: [{ rotate: '45deg' }],
                  borderLeftWidth: 60,
                  borderRightWidth: 60,
                  borderBottomWidth: 120,
                  borderStyle: 'solid',
                  backgroundColor: 'transparent',
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: theme.colors.success.primary,
                }}
              />
              <View style={styles.metaLeft}>
                <View>
                  <Text style={styles.labelId}>Receipt ID:</Text>
                  <Text style={styles.id}>#{receipt.invoice_receipt_id}</Text>
                </View>
                <View style={{ marginTop: theme.spacing.sm }}>
                  <Text style={styles.labelId}>Date:</Text>
                  <Text style={styles.id}>{receipt.invoice_receipt_date}</Text>
                </View>
              </View>
              <View style={[styles.totalContainer, styles.metaRight]}>
                <Text style={styles.totalHeading}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                  {`${Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: userData?.currency ?? 'GBP',
                  }).format(
                    parseFloat(removeCurrencySymbol(receipt.total!) || '0'),
                  )}`}
                </Text>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                backgroundColor: '#fff',
                borderRadius: 12,
                marginTop: 25,
                padding: theme.spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: theme.font.semibold,
                  color: '#333',
                }}
              >
                Vendor
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 15,
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#DDF7DF',
                  }}
                >
                  <ShopIcon />
                </View>
                <View style={{ marginLeft: 15 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: theme.font.semibold,
                      color: '#333',
                    }}
                  >
                    {receipt.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: theme.font.medium,
                      color: '#333',
                      marginTop: theme.spacing.xxs,
                    }}
                  >
                    {receipt.address_block}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableTitle}>ITEMS</Text>
                <Text style={styles.tableTitle}>PRICE</Text>
              </View>
              {receipt.items.map((x, i: number) => (
                <View style={styles.tableItem} key={i}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        backgroundColor: '#EFEFEF',
                        borderRadius: 15,
                        width: 40,
                        height: 40,
                        marginRight: theme.spacing.sm,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: '#333',
                          fontFamily: theme.font.semibold,
                        }}
                      >
                        {i + 1 > 0 ? `0${i + 1}` : i}
                      </Text>
                    </View>
                    <Text style={styles.tableItemTitle}>{x.item}</Text>
                  </View>
                  <Text style={styles.tableItemCost}>
                    {`${Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: userData?.currency ?? 'GBP',
                    }).format(
                      parseFloat(removeCurrencySymbol(x.price) || '0'),
                    )}`}
                  </Text>
                </View>
              ))}
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <View
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 25,
                    backgroundColor: '#f5f5f5',
                    position: 'absolute',
                    right: -12.5,
                  }}
                />
                <View
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 25,
                    backgroundColor: '#f5f5f5',
                    left: -12.5,
                  }}
                />
              </View>

              {receipt.subtotal && (
                <View style={styles.tableItem}>
                  <Text style={styles.tableItemTitle}>Subtotal</Text>
                  <Text style={styles.tableItemCost}>
                    {' '}
                    {`${Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: userData?.currency ?? 'GBP',
                    }).format(
                      parseFloat(removeCurrencySymbol(receipt.subtotal) || '0'),
                    )}`}
                  </Text>
                </View>
              )}

              {receipt.tax && (
                <View style={styles.tableItem}>
                  <Text style={styles.tableItemTitle}>Tax</Text>
                  <Text style={styles.tableItemCost}>{receipt.tax}</Text>
                </View>
              )}

              {receipt.total && (
                <View
                  style={[
                    styles.tableItem,
                    {
                      marginBottom: 40,
                      paddingTop: theme.spacing.md,
                      borderTopWidth: 0.5,
                      borderTopColor: 'rgba(0,0,0,0.05)',
                    },
                  ]}
                >
                  <Text style={styles.tableItemTitleTotal}>Total</Text>
                  <Text style={styles.tableItemCostTotal}>
                    {`${Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency:
                        userData?.currency ?? 'GBP',
                    }).format(
                      parseFloat(removeCurrencySymbol(receipt.total) || '0'),
                    )}`}
                  </Text>
                </View>
              )}

              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'absolute',
                  bottom: -8,
                }}
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 25,
                      backgroundColor: '#f5f5f5',
                      marginHorizontal: 7.5,
                      ...(i === 0 && { marginLeft: 0 }),
                      ...(i === 16 && { marginRight: 0 }),
                    }}
                  />
                ))}
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                marginTop: theme.spacing.lg,
                padding: theme.spacing.md,
              }}
            >
              <Text style={styles.sectionTitle}>Original Receipt</Text>
              <TouchableWithoutFeedback
                onPress={() => setShow(true)}
                style={styles.receipt}
              >
                {receipt.photoUrl?.includes('-pdf') ? (
                  <Pdf
                    source={{ uri: receipt.photoUrl }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <Image
                    source={{ uri: receipt.photoUrl ?? '' }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
              </TouchableWithoutFeedback>
            </View>
          </ScrollView>
        </View>
      </View>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        animateOnMount={true}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView contentContainerStyle={styles.modal}>
          <View style={styles.largeContainer}>
            <View style={styles.left}>
              <ReceiptIcon />
              <View style={styles.folderContent}>
                <Text style={styles.title}>{receipt.name}</Text>
                <Text style={styles.subtitle}>
                  {toFormattedDate(receipt.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vendor name</Text>
            <BottomSheetTextInput
              placeholder="Enter vendor name"
              style={styles.input}
              placeholderTextColor="#999"
              value={tempDetails.name ?? ''}
              onChangeText={value =>
                setTempDetails({ ...tempDetails, name: value })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Receipt ID</Text>
            <BottomSheetTextInput
              placeholder="Enter receipt id"
              style={styles.input}
              placeholderTextColor="#999"
              value={tempDetails.invoice_receipt_id ?? ''}
              onChangeText={value =>
                setTempDetails({ ...tempDetails, invoice_receipt_id: value })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address</Text>
            <BottomSheetTextInput
              placeholder="Enter receipt address"
              style={styles.input}
              placeholderTextColor="#999"
              value={tempDetails.address_block ?? ''}
              onChangeText={value =>
                setTempDetails({ ...tempDetails, address_block: value })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <BottomSheetTextInput
              placeholder="Enter date"
              style={styles.input}
              placeholderTextColor="#999"
              value={tempDetails?.invoice_receipt_date ?? ''}
              onFocus={() => openDatePicker()}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Currency</Text>
            <Pressable
              onPress={() => currencyBottomSheetRef.current?.present()}
            >
              <Text
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: '#000',
                  marginTop: 10,
                  width: '100%',
                }}
              >
                {userData?.currency ?? 'GBP'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Total
              {/*{` (${getParamByParam(*/}
              {/*  'currency',*/}
              {/*  tempDetails?.currency ?? 'GBP',*/}
              {/*  'symbol',*/}
              {/*)})`}*/}{' '}
              {`${Intl.NumberFormat('en-GB', {
                style: 'currency',
                currency: userData?.currency ?? 'GBP',
              }).format(parseFloat(tempDetails.total || '0'))}`}
            </Text>
            <BottomSheetTextInput
              placeholder="Enter total"
              style={styles.input}
              placeholderTextColor="#999"
              value={tempDetails.total ?? ''}
              keyboardType="numeric"
              onChangeText={payload => {
                const result = payload?.replace(/[^\d.]/g, '') || '';
                setTempDetails({ ...tempDetails, total: result });
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text>
              Tax
              {` (${getParamByParam(
                'currency',
                userData?.currency ?? 'GBP',
                'symbol',
              )})`}
            </Text>
            <BottomSheetTextInput
              placeholder="Enter tax"
              placeholderTextColor="#999"
              style={styles.input}
              value={tempDetails.tax ?? ''}
              keyboardType="numeric"
              onChangeText={payload => {
                const result = payload?.replace(/[^\d.]/g, '') || '';
                setTempDetails({ ...tempDetails, tax: result });
              }}
            />

            <View>
              {tempDetails.items.map((x, i) => (
                <View key={i}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemLabel}>ITEM {i + 1}</Text>
                    <Pressable
                      onPress={() => {
                        const items = tempDetails.items.filter(
                          (_y, a) => a !== i,
                        );

                        setTempDetails({ ...tempDetails, items });
                      }}
                    >
                      <ItemDeleteIcon />
                    </Pressable>
                  </View>

                  <View style={styles.inputHorizontalContainer}>
                    <View style={styles.inputHorizontalItem}>
                      <Text style={styles.label}>Name</Text>
                      <BottomSheetTextInput
                        placeholder="Item name"
                        placeholderTextColor="#999"
                        style={styles.input}
                        value={x.item ?? ''}
                        onChangeText={value => {
                          const item = { ...x, item: value };
                          const items = [...tempDetails.items];
                          items[i] = item;
                          setTempDetails({ ...tempDetails, items });
                        }}
                      />
                    </View>
                    <View style={styles.inputHorizontalItem}>
                      <Text style={styles.label}>Price</Text>
                      <BottomSheetTextInput
                        placeholder="Item price"
                        placeholderTextColor="#999"
                        style={styles.input}
                        value={x.price ?? ''}
                        onChangeText={payload => {
                          const result = payload?.replace(/[^\d.]/g, '') || '';
                          const item = { ...x, price: result };
                          const items = [...tempDetails.items];
                          items[i] = item;
                          setTempDetails({ ...tempDetails, items });
                        }}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Pressable style={styles.button} onPress={update}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={currencyBottomSheetRef}
        snapPoints={currencySnapPoints}
        animateOnMount={true}
        backdropComponent={renderBackdrop}
      >
        <CurrencyList
          onItemPress={item => {
            onChangeCurrency(item.currency);
            currencyBottomSheetRef?.current?.close();
          }}
        />
      </BottomSheetModal>

      <ImageView
        images={receipt?.urls?.map(x => ({ uri: x })) ?? []}
        imageIndex={0}
        visible={show}
        onRequestClose={() => setShow(false)}
      />

      <DatePicker
        date={new Date()}
        modal
        mode="date"
        onCancel={() => {
          setShowDatePicker(false);
        }}
        onConfirm={onConfirmDateSelection}
        open={showDatePicker}
        theme={'light'}
      />
    </BottomSheetModalProvider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-shadow
const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    itemHeader: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    inputHorizontalContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
    },
    inputHorizontalItem: {
      width: '48%',
    },
    buttonText: {
      fontFamily: theme.font.medium,
      color: theme.colors.button.color,
    },
    button: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.button.background,
      color: theme.colors.button.color,
      borderRadius: 14,
      minHeight: 55,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.dark,
    },
    itemLabel: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.dark,
    },
    input: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
      fontSize: 14,
      ...(Platform.OS === 'ios' && {
        height: 30,
      }),
    },
    modal: {
      padding: theme.spacing.sm,
      paddingHorizontal: '5%',
      paddingBottom: theme.spacing.xxl,
    },
    folderContent: {
      marginLeft: theme.spacing.md,
    },
    subtitle: {
      color: theme.colors.text.light,
      fontFamily: theme.font.regular,
    },
    largeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '100%',
      backgroundColor: theme.colors.card.background,
      borderRadius: 15,
      marginBottom: theme.spacing.lg,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      marginBottom: theme.spacing.xxs,
      fontSize: 16,
    },
    subheaderTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.semibold,
      fontSize: 22,
      marginTop: theme.spacing.lg,
    },
    subheaderSubtitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.medium,
      fontSize: 14,
    },
    pen: {
      marginRight: theme.spacing.md,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    item: {
      padding: theme.spacing.md,
      backgroundColor: 'rgba(0,15,72,0.05)',
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    iconButton: {
      width: 50,
      height: 50,
      backgroundColor: 'rgba(0,15,72,0.1)',
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.medium,
      fontSize: 16,
    },
    itemSubtitle: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 14,
    },
    scrollviewContent: {
      paddingTop: 180,
      paddingBottom: 40,
    },
    featuredItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    featuredItemText: {
      color: theme.colors.text.white,
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
    },
    featuredItemContainer: {
      width: '90%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'space-around',
      minHeight: 70,
      borderRadius: 20,
      backgroundColor: '#0032FA',
      position: 'absolute',
      top: -35,
      flexDirection: 'row',
      zIndex: 1000,
    },
    content: {
      width: '100%',
      height: '100%',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      zIndex: 1000,
    },
    scrollview: {
      padding: theme.spacing.md,
      height: Dimensions.get('window').height * 0.7,
    },
    profileContainer: {
      width: 110,
      height: 110,
      borderRadius: 110,
      borderWidth: 1,
      borderColor: theme.colors.text.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 100,
      backgroundColor: theme.colors.text.white,
    },
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text.white,
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      backgroundColor: '#fff',
      padding: '5%',
      paddingTop: theme.spacing.xxl,
      position: 'absolute',
      width: '100%',
      zIndex: 99999999,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaContainer: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      padding: theme.spacing.md,
      borderRadius: 10,
      width: '100%',
      maxHeight: 120,
      overflow: 'hidden',
    },
    totalContainer: {
      padding: theme.spacing.sm,
    },
    id: {
      color: '#333333',
      fontFamily: theme.font.semibold,
      fontSize: 15,
    },
    labelId: {
      color: '#333333',
      fontFamily: theme.font.regular,
      fontSize: 13,
      marginBottom: theme.spacing.xxs,
    },
    address: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 13,
    },
    totalHeading: {
      color: '#333333',
      fontFamily: theme.font.regular,
      fontSize: 13,
      marginBottom: theme.spacing.xxs,
    },
    totalAmount: {
      color: '#333',
      fontFamily: theme.font.semibold,
      fontSize: 28,
    },
    tableTitle: {
      color: '#333',
      fontFamily: theme.font.semibold,
      fontSize: 14,
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: 10,
    },
    table: {
      marginTop: theme.spacing.lg,
      borderRadius: 10,
      backgroundColor: '#fff',
    },
    tableItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    tableItemTitle: {
      color: '#333333',
      fontFamily: theme.font.medium,
      fontSize: 14,
    },
    tableItemCost: {
      color: '#333333',
      fontFamily: theme.font.semibold,
      fontSize: 14,
    },
    tableItemTitleTotal: {
      color: '#333333',
      fontFamily: theme.font.medium,
      fontSize: 18,
    },
    tableItemCostTotal: {
      color: '#333333',
      fontFamily: theme.font.semibold,
      fontSize: 24,
    },
    metaLeft: {
      width: '50%',
    },
    metaRight: {
      width: '50%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderLeftWidth: 0.5,
      borderLeftColor: 'rgba(0,0,0,0.1)',
    },

    sectionTitle: {
      color: '#000',
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginBottom: theme.spacing.xs,
    },
    receipt: {
      width: '100%',
      height: 400,
      borderRadius: 10,
      marginTop: theme.spacing.sm,
      backgroundColor: '#f2f2f2',
    },
  }),
);
