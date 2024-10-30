import { StyleSheet, Text, View } from 'react-native';
import NoReceiptIcon from '../../../../assets/svg/no-receipt';
import ButtonComponent from '../../../../components/button/button-component';
import { styleSheetFactory, useTheme } from '../../../../theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from '../../../../navigation/navigator';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useRef } from 'react';
import useSubscription from '../../../../hooks/use_subscription';

const EmptyInvoice = () => {
  const [styles] = useTheme(Styles);
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { subscription } = useSubscription();
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
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <NoReceiptIcon />
      <Text style={styles.emptyTitle}>Create an Invoice</Text>
      <Text style={styles.emptySubtitle}>
        Let's get started by creating an invoice
      </Text>
      <ButtonComponent
        title={'Create Invoice'}
        onPress={() => {
          if (!subscription?.active) {
            bottomSheetRef.current?.present();
            return;
          }
          navigate('CreateInvoice');
        }}
      />

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

export default EmptyInvoice;

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
  }),
);
