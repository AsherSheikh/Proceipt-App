import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Customer } from '../../../../entities/customer';
import { Timestamp } from '@firebase/firestore';
import uuid from 'react-native-uuid';
import auth from '@react-native-firebase/auth';
import React, { useRef, useState } from 'react';
import useOrganisation from '../../../../hooks/use_organisation';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import ButtonComponent from '../../../../components/button/button-component';
import { styleSheetFactory, useTheme } from '../../../../theme';
import Toast from 'react-native-toast-message';
import useCustomer from '../../../../hooks/use_customer';
import { CountryList } from '../../../../components/country/country-list';

type Props = {
  onSuccess: (customer: Customer) => void;
};
const CreateCustomerBottomSheet = ({ onSuccess }: Props) => {
  const { organisation } = useOrganisation();
  const { create } = useCustomer();
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
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<Customer>(initialClient);
  const [styles] = useTheme(Styles);
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
      const data = { ...client, createdAt: Timestamp.now() };
      await create(data);
      Toast.show({
        type: 'success',
        text1: 'Client saved successfully',
      });
      setClient(initialClient);
      onSuccess(data);
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
  const countriesBottomSheetRef = useRef<BottomSheetModal>(null);
  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };
  return (
    <>
      <BottomSheetScrollView
        style={{
          padding: 20,
        }}
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
        >
          Create a new customer
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
      </BottomSheetScrollView>
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
    </>
  );
};

export default CreateCustomerBottomSheet;

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
