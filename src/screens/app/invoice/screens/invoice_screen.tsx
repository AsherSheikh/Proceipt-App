import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useRef } from 'react';
import useOrganisation from '../../../../hooks/use_organisation';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from '../../../../navigation/navigator';
import useSubscription from '../../../../hooks/use_subscription';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { styleSheetFactory, useTheme } from '../../../../theme';
import ButtonComponent from '../../../../components/button/button-component';
import InvoiceFeatureAppbar from '../components/invoice_feature_appbar';
import Toast from 'react-native-toast-message';
import MyInvoices from '../components/my_invoices';
import NoOrganisation from '../../organisation/components/no_organisation';

const InvoiceScreen = () => {
  const { organisation } = useOrganisation();
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();
  const { subscription } = useSubscription();
  const [styles] = useTheme(Styles);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
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
    <View
      style={{
        flex: 1,
      }}
    >
      <InvoiceFeatureAppbar
        title={'Invoice'}
        buttonText={'Create Invoice'}
        onPress={() => {
          if (organisation?.id && !subscription?.active) {
            bottomSheetRef.current?.present();
            return;
          }

          if (!organisation?.id) {
            return Toast.show({
              type: 'error',
              text1: 'Please create an organisation',
              text2: 'Before creating an invoice',
            });
          }
          navigate('CreateInvoice');
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{
          flexGrow: 1,
          padding: 10,
        }}
      >
        {organisation ? (
          <>{organisation.id ? <MyInvoices /> : <NoOrganisation />}</>
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <ActivityIndicator />
          </View>
        )}
      </ScrollView>

      <BottomSheetModal
        ref={bottomSheetRef}
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
          <Text style={styles.heading}>Upgrade Your Plan</Text>
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
    </View>
  );
};

export default InvoiceScreen;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
    },
    heading: {
      fontFamily: theme.font.semibold,
      fontSize: 18,
      color: theme.colors.text.main,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subText: {
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
      fontSize: 15,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
      textAlign: 'center',
    },
  }),
);
