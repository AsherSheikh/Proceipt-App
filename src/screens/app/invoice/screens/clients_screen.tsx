import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InvoiceFeatureAppbar from '../components/invoice_feature_appbar';
import { styleSheetFactory, theme, useTheme } from '../../../../theme';
import useCustomer from '../../../../hooks/use_customer';
import ClientRow from '../components/client_row';
import React, { useMemo, useRef, useState } from 'react';
import { Customer } from '../../../../entities/customer';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CountryList } from '../../../../components/country/country-list';
import { DeleteIcon } from '../../../../assets/svg/delete';
import EditIcon from '../../../../assets/svg/edit';
import Toast from 'react-native-toast-message';
import ButtonComponent from '../../../../components/button/button-component';
import { Timestamp } from '@firebase/firestore';
import useOrganisation from '../../../../hooks/use_organisation';
import uuid from 'react-native-uuid';
import auth from '@react-native-firebase/auth';

const ClientsScreen = () => {
  const insets = useSafeAreaInsets();
  const [styles] = useTheme(Styles);
  const { customers, create, deleteCustomer, update } = useCustomer();
  const { organisation } = useOrganisation();
  const [modalType, setModalType] = useState<
    'OPTIONS' | 'DELETE' | 'UPDATE' | 'CREATE'
  >('OPTIONS');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const initialClient: Customer = {
    name: '',
    email: '',
    createdAt: Timestamp.now(),
    organisationId: organisation!.id,
    id: uuid.v4() as string,
    userId: auth().currentUser?.uid as string,
    address: {
      address1: '',
      address2: '',
      city: '',
      country: '',
      state: '',
      zipcode: '',
    },
  };

  const [client, setClient] = useState<Customer>(initialClient);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const countriesBottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => {
    if (modalType === 'CREATE' || modalType === 'UPDATE') {
      return ['90%'];
    }
    if (modalType === 'OPTIONS') {
      return [220];
    }
    return [250];
  }, [modalType]);

  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };

  const saveClient = async () => {
    if (!client.name) {
      return Toast.show({
        type: 'error',
        text1: 'Client Name is required',
      });
    }
    if (!client.address.country) {
      return Toast.show({
        type: 'error',
        text1: 'Country is required',
      });
    }
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (client.email && !emailRegex.test(client.email)) {
      return Toast.show({
        type: 'error',
        text1: 'Invalid client email address',
      });
    }
    try {
      setLoading(true);
      if (modalType === 'CREATE') {
        await create({ ...client, createdAt: Timestamp.now() });
      } else if (modalType === 'UPDATE') {
        await update({ ...client, updatedAt: Timestamp.now() });
      }
      bottomSheetRef.current?.dismiss();
      Toast.show({
        type: 'success',
        text1: 'Client saved successfully',
      });
      setClient(initialClient);
      // reset({ index: 0, routes: [{ name: 'Clients' }] });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save client',
        text2: 'Please try again',
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
          paddingBottom: insets.bottom,
        }}
      >
        <InvoiceFeatureAppbar
          title={'Clients'}
          buttonText={'Add Client'}
          showBack
          onPress={() => {
            setSelectedCustomer(null);
            setModalType('CREATE');
            bottomSheetRef.current?.present();
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: '5%' }}>
          <Text
            style={{
              marginTop: 25,
              paddingBottom: 10,
            }}
          >
            Manage all your clients or customers you may need to send invoices
            to
          </Text>
          {customers!.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{
                flex: 1,
                paddingVertical: 20,
              }}
            >
              {customers!.map(customer => (
                <ClientRow
                  key={customer.id}
                  client={customer}
                  onPress={() => {
                    setSelectedCustomer(customer);
                    setModalType('OPTIONS');
                    bottomSheetRef.current?.present();
                  }}
                />
              ))}
            </ScrollView>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={styles.emptyTitle}>Add your first client</Text>
              <Text style={styles.emptySubtitle}>To get started</Text>
              <ButtonComponent
                title={'Add Client'}
                onPress={() => {
                  setSelectedCustomer(null);
                  setModalType('CREATE');
                  bottomSheetRef.current?.present();
                }}
              />
            </View>
          )}
        </View>

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
                    setModalType('UPDATE');
                    setClient(selectedCustomer!);
                    bottomSheetRef.current?.present();
                  }}
                  style={styles.optionsContainer}
                >
                  <View style={styles.sortTextContainer}>
                    <EditIcon />
                    <Text style={styles.optionsTitle}>Edit Client</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setModalType('DELETE');
                  }}
                  style={styles.optionsContainer}
                >
                  <View style={styles.sortTextContainer}>
                    <DeleteIcon />
                    <Text style={styles.optionsTitle}>Delete Client</Text>
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
                  Are you sure you want to delete {selectedCustomer?.name}?
                </Text>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { marginBottom: 20, backgroundColor: '#FF0000' },
                  ]}
                  onPress={async () => {
                    await deleteCustomer(selectedCustomer?.id!);
                    bottomSheetRef.current?.close();
                    Toast.show({
                      type: 'success',
                      text1: 'Client Deleted',
                      text2: `${selectedCustomer?.name} deleted successfully`,
                    });
                    setSelectedCustomer(null);
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

            {(modalType === 'CREATE' || modalType === 'UPDATE') && (
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
                  {modalType === 'CREATE'
                    ? 'Add a new Client'
                    : 'Update Client'}
                </Text>
                <View style={styles.formInput}>
                  <Text style={styles.label}>Client / Company Name *</Text>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    style={styles.inputContainer}
                    placeholder="ABC Company"
                    value={client.name}
                    onChangeText={text => {
                      setClient({ ...client, name: text });
                    }}
                  />
                </View>
                <View style={styles.formInput}>
                  <Text style={styles.label}>Client Email</Text>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    style={styles.inputContainer}
                    placeholder="abc@company.com"
                    keyboardType={'email-address'}
                    value={client.email}
                    onChangeText={text => {
                      setClient({ ...client, email: text });
                    }}
                  />
                </View>
                <View style={styles.formInput}>
                  <Text style={styles.label}>Country *</Text>
                  <Pressable
                    onPress={() => {
                      countriesBottomSheetRef.current?.present();
                    }}
                    style={styles.inputContainer}
                  >
                    {client.address.country ? (
                      <Text>{client.address.country}</Text>
                    ) : (
                      <Text>Choose country</Text>
                    )}
                  </Pressable>
                </View>
                <View style={styles.formInput}>
                  <Text style={styles.label}>City or Town</Text>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    style={styles.inputContainer}
                    placeholder="London"
                    value={client.address.city}
                    onChangeText={text => {
                      setClient({
                        ...client,
                        address: { ...client.address, city: text },
                      });
                    }}
                  />
                </View>
                <View style={styles.formInput}>
                  <Text style={styles.label}>Address 1</Text>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    style={styles.inputContainer}
                    placeholder="123 Main Street"
                    value={client.address.address1}
                    onChangeText={text => {
                      setClient({
                        ...client,
                        address: { ...client.address, address1: text },
                      });
                    }}
                  />
                </View>
                <View style={styles.formInput}>
                  <Text style={styles.label}>Address 2</Text>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    style={styles.inputContainer}
                    placeholder="Apartment, Suite, etc."
                    value={client.address.address2}
                    onChangeText={text => {
                      setClient({
                        ...client,
                        address: { ...client.address, address2: text },
                      });
                    }}
                  />
                </View>
                <View style={styles.formInput}>
                  <Text style={styles.label}>Zip / Post Code</Text>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    style={styles.inputContainer}
                    placeholder="Apartment, Suite, etc."
                    value={client.address.zipcode}
                    onChangeText={text => {
                      setClient({
                        ...client,
                        address: { ...client.address, zipcode: text },
                      });
                    }}
                  />
                </View>
                <ButtonComponent
                  title={'Save'}
                  loading={loading}
                  disabled={loading}
                  onPress={saveClient}
                />
              </>
            )}
          </BottomSheetScrollView>
        </BottomSheetModal>

        <BottomSheetModal
          ref={countriesBottomSheetRef}
          snapPoints={['80%']}
          animateOnMount={true}
          backdropComponent={renderBackdrop}
        >
          <CountryList
            onItemPress={item => {
              setClient({
                ...client,
                address: { ...client.address, country: item.name },
              });
              countriesBottomSheetRef?.current?.close();
            }}
          />
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

export default ClientsScreen;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
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
      marginBottom: theme.spacing.md,
      lineHeight: 22,
    },
    formInput: {
      marginBottom: theme.spacing.sm,
    },
    inputContainer: {
      paddingVertical: theme.spacing.xxxs,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderRadius: 14,
      borderColor: theme.colors.input.outline,
      backgroundColor: theme.colors.input.background,
      flexDirection: 'row',
      alignItems: 'center',
      height: 50,
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
  }),
);
