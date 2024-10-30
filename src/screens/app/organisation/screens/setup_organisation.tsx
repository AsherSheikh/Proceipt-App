import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeftArrow } from '../../../../assets/svg/left-arrow';
import { styleSheetFactory, theme, useTheme } from '../../../../theme';
import React, { useMemo, useRef, useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { launchImageLibrary } from 'react-native-image-picker';
import { ImageResult, manipulateAsync } from 'expo-image-manipulator';
import { DefaultProfilePhoto } from '../../../../utils/constants';
import { PenSettingsIcon } from '../../../../assets/svg/pen-settings';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { TextInput } from 'react-native-gesture-handler';
import { CountryList } from '../../../../components/country/country-list';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { CurrencyList } from '../../../../components/currency/currency-list';
import ButtonComponent from '../../../../components/button/button-component';
import Toast from 'react-native-toast-message';
import { yupResolver } from '@hookform/resolvers/yup';
import useOrganisation from '../../../../hooks/use_organisation';
import { RootStackParameterList } from '../../../../navigation/navigator';
import { getFbError } from '../../../../utils/get-fb-error';
import { uploadImageToStorage } from '../../../../utils/upload_image';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import uuid from 'react-native-uuid';
import { Organisation } from '../../../../entities/organisation';

type FormValues = {
  name: string;
  email: string;
  city: string;
  state: string;
  address1: string;
  address2: string;
  zipcode: string;
};

const SetupOrganisationScreen = () => {
  const insets = useSafeAreaInsets();
  const [styles] = useTheme(Styles);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const currencyBottomSheetRef = useRef<BottomSheetModal>(null);
  const freeTrialBottomSheetRef = useRef<BottomSheetModal>(null);

  const { create } = useOrganisation();
  const { goBack } = useNavigation<NavigationProp<RootStackParameterList>>();
  const snapPoints = useMemo(() => ['75%'], []);
  const [currency, setCurrency] = useState<string>('GBP');
  const [logo, setLogo] = useState<ImageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<{
    name: string;
    dial_code: string;
    flag: string;
  } | null>(null);
  const schema = yup.object({
    name: yup.string().required('Organisation name is required'),
    email: yup
      .string()
      .email('Organisation email should be a valid email')
      .required('Organisation email is required'),
    city: yup.string().required('City is required'),
    state: yup.string().optional(),
    address1: yup.string().optional(),
    address2: yup.string().optional(),
    zipcode: yup.string().optional(),
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

  const onChooseImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
      });

      const asset = result?.assets?.[0];

      if (asset) {
        const response = await manipulateAsync(asset.uri as string, [], {
          base64: true,
          compress: 0.8,
        });
        setLogo(response);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      city: '',
      state: '',
      address1: '',
      address2: '',
      zipcode: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!country) {
      return Toast.show({
        type: 'error',
        text1: 'Country is required',
        text2: 'Please select a country',
      });
    }
    let logoUrl = '';
    setLoading(true);

    try {
      if (logo) {
        logoUrl = await uploadImageToStorage({
          uri: logo.uri!,
        });
      }
      const organisation: Organisation = {
        name: data.name,
        email: data.email,
        createdAt: firestore.Timestamp.now(),
        phone: '',
        userId: auth().currentUser?.uid!,
        id: uuid.v4() as string,
        logo: logoUrl,
        address: {
          country: country?.name,
          address2: data.address2,
          address1: data.address1,
          state: data.state,
          zipcode: data.zipcode,
          city: data.city,
        },
        currency: currency,
      };
      await create(organisation);
      Toast.show({
        type: 'success',
        text1: 'Organisation created successfully',
        text2: 'Your organisation has been created successfully',
      });
      freeTrialBottomSheetRef.current?.present();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getFbError(error.code),
        text2: "We couldn't create your organisation",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetModalProvider>
      <View
        style={{
          paddingTop: insets.top + 15,
          paddingHorizontal: '5%',
          paddingBottom: insets.bottom,
          flex: 1,
        }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => goBack()} style={styles.leftHeader}>
            <LeftArrow color={theme.colors.text.darkGrey} />
            <Text style={styles.headerText}>Setup Organisation</Text>
          </Pressable>
        </View>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          extraScrollHeight={55}
        >
          <View
            style={{
              flex: 1,
              paddingVertical: 40,
            }}
          >
            <Pressable onPress={onChooseImage} style={styles.profileContainer}>
              <Image
                source={{ uri: logo?.uri || DefaultProfilePhoto }}
                style={styles.profileImage}
              />
              <View style={styles.editProfile}>
                <PenSettingsIcon />
              </View>
            </Pressable>
            <Text
              style={{
                textAlign: 'center',
                marginTop: 18,
                marginBottom: 40,
                fontSize: 14,
                fontFamily: theme.font.medium,
              }}
            >
              Add your organisation's logo
            </Text>
            <Text style={styles.heading}>Basic details</Text>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>Organisation Name *</Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="John Anderson Ltd"
                      onBlur={onBlur}
                      onChangeText={x => onChange(x)}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="name"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </View>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>Organisation Email *</Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[styles.inputContainer]}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="john.anderson@me.com"
                      onBlur={onBlur}
                      keyboardType={'email-address'}
                      onChangeText={x => onChange(x.trim().toLowerCase())}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="email"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}
            </View>
            <Text style={[styles.heading, { marginTop: 20 }]}>
              Organisation Address
            </Text>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>Country *</Text>
              <Pressable
                onPress={() => bottomSheetRef.current?.present()}
                style={styles.inputContainer}
              >
                {country ? (
                  <Text style={styles.input}>{country.name}</Text>
                ) : (
                  <Text>Choose country</Text>
                )}
              </Pressable>
            </View>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>City *</Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="London"
                      onBlur={onBlur}
                      onChangeText={x => onChange(x)}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="city"
              />
              {errors.city && (
                <Text style={styles.errorText}>{errors.city.message}</Text>
              )}
            </View>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>State / Region</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="London"
                      onBlur={onBlur}
                      onChangeText={x => onChange(x)}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="state"
              />
            </View>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>Address 1</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="123 London Road"
                      onBlur={onBlur}
                      onChangeText={x => onChange(x)}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="address1"
              />
            </View>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>Address 2</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="Apartment 2"
                      onBlur={onBlur}
                      onChangeText={x => onChange(x)}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="address2"
              />
            </View>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>Zip Code</Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholderTextColor="#999"
                      placeholder="123 456"
                      onBlur={onBlur}
                      onChangeText={x => onChange(x)}
                      value={value}
                      style={styles.input}
                    />
                  </View>
                )}
                name="zipcode"
              />
            </View>
            <Text style={styles.heading}>Preferences</Text>
            <View style={styles.inputSpacer}>
              <Text style={styles.label}>Currency</Text>
              <Pressable
                onPress={() => currencyBottomSheetRef.current?.present()}
                style={styles.inputContainer}
              >
                {currency ? (
                  <Text style={styles.input}>{currency}</Text>
                ) : (
                  <Text>Choose Currency</Text>
                )}
              </Pressable>
            </View>
            <ButtonComponent
              title={'Finish'}
              disabled={loading}
              loading={loading}
              onPress={() => {
                handleSubmit(onSubmit)();
              }}
            />
          </View>
        </KeyboardAwareScrollView>
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          animateOnMount={true}
          backdropComponent={renderBackdrop}
        >
          <CountryList
            onItemPress={item => {
              setCountry(item);
              bottomSheetRef?.current?.close();
            }}
          />
        </BottomSheetModal>
        <BottomSheetModal
          ref={currencyBottomSheetRef}
          snapPoints={snapPoints}
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
        <BottomSheetModal
          ref={freeTrialBottomSheetRef}
          snapPoints={[280]}
          index={0}
          backdropComponent={renderBackdrop}
          style={styles.bottomSheet}
          onDismiss={goBack}
        >
          <BottomSheetScrollView
            style={{
              padding: 20,
            }}
          >
            <Text style={[styles.heading, { textAlign: 'center' }]}>
              Enjoy 7 Days Free Trial
            </Text>
            <Text style={styles.subText}>
              Start 7 days free trial of our Invoicing feature without any
              credit card. Your data will still be kept after the trial for easy
              export.
            </Text>
            <ButtonComponent
              title={'Continue'}
              onPress={() => {
                freeTrialBottomSheetRef.current?.dismiss();
                goBack();
              }}
            />
          </BottomSheetScrollView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

export default SetupOrganisationScreen;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    headerText: {
      color: '#333',
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    bottomSheet: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
    },
    subText: {
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
      fontSize: 15,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
    },
    profileContainer: {
      width: 110,
      height: 110,
      borderRadius: 110,
      borderWidth: 2,
      borderColor: theme.colors.text.main,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      alignSelf: 'center',
    },
    editProfile: {
      position: 'absolute',
      backgroundColor: theme.colors.text.main,
      borderWidth: 2,
      borderColor: '#fff',
      width: 40,
      height: 40,
      borderRadius: 40,
      bottom: 0,
      right: -15,
      top: 70,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 100,
      backgroundColor: theme.colors.text.main,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      fontFamily: theme.font.medium,
      fontSize: 13,
      textTransform: 'capitalize',
      marginBottom: theme.spacing.xs,
    },
    errorText: {
      color: theme.colors.error.primary,
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xxs,
      marginLeft: theme.spacing.xs,
    },
    heading: {
      fontFamily: theme.font.semibold,
      fontSize: 18,
      color: theme.colors.text.main,
      textTransform: 'capitalize',
      marginBottom: theme.spacing.sm,
    },
    inputSpacer: {
      marginBottom: theme.spacing.md,
    },

    input: {
      fontFamily: theme.font.medium,
      fontSize: 13,
      width: '80%',
      color: '#000',
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
  }),
);
