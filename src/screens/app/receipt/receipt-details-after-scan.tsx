import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { styleSheetFactory, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import ImageView from 'react-native-image-viewing';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
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
import {
  useLazyReadReceiptQuery,
  useUpdateReceiptMutation,
} from 'features/receipt/receipt-reducer';
import firestore from '@react-native-firebase/firestore';
import { OrganisationFolder, ReceiptWithUploadedAt } from '../../../utils/type';
import { useSelector } from 'react-redux';
import { getUser } from '../../../features/profile/profile-reducer';
import { removeCurrencySymbol } from '../../../utils/currency-format';

export default function ReceiptDetailsScreen() {
  const [styles] = useTheme(Styles);

  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();

  const {
    params: { receipt: details, folderId },
  } = useRoute<RouteProp<RootStackParameterList, 'ReceiptDetails'>>();

  const [fetchReceipt, { data }] = useLazyReadReceiptQuery();

  const [tempDetails, setTempDetails] = useState(details);

  const [updateReceipt, { isLoading, isSuccess }] = useUpdateReceiptMutation();

  const [show, setShow] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['75%'], []);
  const userData = useSelector(getUser);

  console.log('This is data from scanned receipt', details.id);

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

  const share = ({ content }: { content: string }) =>
    Share.share({
      message: content,
    });

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
      console.log('This is the folder id from edit receipt page', folderId);
      /// Receipt belongs to an organisation
      const folderRef = firestore().collection('folders').doc(folderId);
      try {
        // Get the folder document
        const folderDoc = await folderRef.get();

        // Get the receipts array from the folder document
        const folder = folderDoc.data() as OrganisationFolder;
        const receipts = folder.receipts;

        // Find the index of the oldReceipt object with the same ID as the newReceipt object
        const index = receipts.findIndex(value => value.id === tempDetails.id);

        // Replace the oldReceipt object with the newReceipt object
        if (index !== -1) {
          receipts[index] = { ...tempDetails } as ReceiptWithUploadedAt;
        }

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

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <Pressable
              // @ts-ignore
              onPress={() => navigate('App', { screen: 'Home' })}
              style={styles.leftHeader}
            >
              <LeftArrow color="#fff" />
            </Pressable>

            <Pressable
              onPress={() => bottomSheetRef.current?.present()}
              style={styles.leftHeader}
            >
              <PenIcon color="#fff" />
            </Pressable>
          </View>
          <View>
            <Text style={styles.subheaderTitle}>{receipt.name}</Text>
            <Text style={styles.subheaderSubtitle}>
              P-ID: #{receipt.id} | Date: {receipt.invoice_receipt_date}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <ScrollView
            contentContainerStyle={styles.scrollviewContent}
            style={styles.scrollview}
          >
            <View style={styles.metaContainer}>
              <View style={styles.metaLeft}>
                <Text style={styles.id}>ID: {receipt.invoice_receipt_id}</Text>
                <View>
                  <Text style={styles.address}>Address</Text>
                  <Text style={styles.address}>
                    {receipt.address_block ?? '-'}
                  </Text>
                </View>
              </View>
              <View style={[styles.totalContainer, styles.metaRight]}>
                <Text style={styles.totalHeading}>Total</Text>
                <Text style={styles.totalAmount}>
                  {' '}
                  {`${Intl.NumberFormat('en-GB', {
                    style: 'currency',
                    currency: userData?.currency ?? 'GBP',
                  }).format(
                    parseFloat(removeCurrencySymbol(receipt.total!) || '0'),
                  )}`}
                </Text>
              </View>
            </View>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableTitle}>Items</Text>
                <Text style={styles.tableTitle}>Cost</Text>
              </View>
              {receipt.items.map((x, i: number) => (
                <View style={styles.tableItem} key={i}>
                  <Text style={styles.tableItemTitle}>{x.item}</Text>
                  <Text style={styles.tableItemCost}>
                    {' '}
                    {`${Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: userData?.currency ?? 'GBP',
                    }).format(
                      parseFloat(removeCurrencySymbol(x.price) || '0'),
                    )}`}
                  </Text>
                </View>
              ))}

              {receipt.subtotal && (
                <View style={styles.tableItem}>
                  <Text style={styles.tableItemTitle}>Subtotal</Text>
                  <Text style={styles.tableItemCost}>
                    {' '}
                    {`${Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: userData?.currency ?? 'GBP',
                    }).format(
                      parseFloat(
                        removeCurrencySymbol(receipt.subtotal!) || '0',
                      ),
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
                <View style={styles.tableItem}>
                  <Text style={styles.tableItemTitle}>Total</Text>
                  <Text style={styles.tableItemCost}>
                    {' '}
                    {`${Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: userData?.currency ?? 'GBP',
                    }).format(
                      parseFloat(removeCurrencySymbol(receipt.total!) || '0'),
                    )}`}
                  </Text>
                </View>
              )}
            </View>

            <View>
              <Text style={styles.sectionTitle}>Original Receipt</Text>
              <TouchableWithoutFeedback
                onPress={() => setShow(true)}
                style={styles.receipt}
              >
                <Image
                  source={{ uri: receipt.photoUrl ?? '' }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 10 }]}
                />
              </TouchableWithoutFeedback>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

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
            <Text style={styles.label}>Total (£)</Text>
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
            <Text>Tax (£)</Text>
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
                        value={removeCurrencySymbol(x.price) ?? ''}
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
      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => {
            // @ts-ignore
            navigate('App', { screen: 'Receipt' });
            Alert.alert(
              'Share Proceipt',
              'Thank you for using Proceipt to save receipts. Do you want your friends to try Proceipt?',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () =>
                    share({
                      content:
                        'Join me to save the world from paper receipts, Sign up for Proceipt here - https://proceipt.page.link/download',
                    }),
                },
              ],
            );
          }}
        >
          <Text style={styles.buttonText}>Go back</Text>
        </Pressable>
      </View>
    </BottomSheetModalProvider>
  );
}

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    footer: {
      position: 'absolute',
      width: '80%',
      alignItems: 'center',
      bottom: 20,
      alignSelf: 'center',
    },
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
      height: 30,
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
      color: theme.colors.text.white,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.semibold,
      fontSize: 22,
      marginTop: theme.spacing.lg,
    },
    subheaderSubtitle: {
      color: 'rgba(255,255,255,0.8)',
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
      paddingBottom: theme.spacing.xxxl,
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
      backgroundColor: '#fff',
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
      backgroundColor: theme.colors.text.main,
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
      backgroundColor: theme.colors.text.main,
      padding: '5%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f2f2f2',
      padding: theme.spacing.md,
      borderRadius: 15,
      width: '100%',
    },
    totalContainer: {
      padding: theme.spacing.sm,
      backgroundColor: '#fff',
      borderRadius: 15,
    },
    id: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 17,
      marginBottom: theme.spacing.xs,
    },
    address: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 13,
    },
    totalHeading: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 12,
    },
    totalAmount: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 17,
    },
    tableTitle: {
      color: theme.colors.text.white,
      fontFamily: theme.font.medium,
      fontSize: 16,
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FB9505',
      padding: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderRadius: 10,
    },
    table: {
      backgroundColor: '#f2f2f2',
      marginTop: theme.spacing.xl,
      borderRadius: 10,
    },
    tableItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    tableItemTitle: {
      color: '#333333',
      fontFamily: theme.font.medium,
      fontSize: 14,
    },
    tableItemCost: {
      color: '#333333',
      fontFamily: theme.font.regular,
      fontSize: 14,
    },
    metaLeft: {
      width: '60%',
    },
    metaRight: {
      width: '35%',
    },

    sectionTitle: {
      color: '#000',
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.xs,
    },
    receipt: {
      width: '100%',
      height: 500,
      borderRadius: 15,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xxxxl,
      backgroundColor: '#f2f2f2',
    },
  }),
);
