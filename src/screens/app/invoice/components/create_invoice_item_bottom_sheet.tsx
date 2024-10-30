import { StyleSheet, Text, View } from 'react-native';
import { Timestamp } from '@firebase/firestore';
import uuid from 'react-native-uuid';
import auth from '@react-native-firebase/auth';
import React, { useState } from 'react';
import useOrganisation from '../../../../hooks/use_organisation';
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import ButtonComponent from '../../../../components/button/button-component';
import { styleSheetFactory, useTheme } from '../../../../theme';
import Toast from 'react-native-toast-message';
import useInvoiceItem from '../../../../hooks/use_invoice_item';
import { InvoiceItem } from '../../../../entities/invoice_item';

type Props = {
  onSuccess: (customer: InvoiceItem) => void;
};
const CreateInvoiceItemBottomSheet = ({ onSuccess }: Props) => {
  const { organisation } = useOrganisation();
  const { create } = useInvoiceItem();
  const initialItem: InvoiceItem = {
    name: '',
    price: 0,
    createdAt: Timestamp.now(),
    organisationId: organisation!.id,
    id: uuid.v4() as string,
    userId: auth().currentUser?.uid as string,
  };
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<InvoiceItem>(initialItem);
  const [styles] = useTheme(Styles);
  const saveItem = async () => {
    if (!item.name) {
      return Toast.show({
        type: 'error',
        text1: 'Client Name is required',
      });
    }
    try {
      setLoading(true);
      const data = { ...item, createdAt: Timestamp.now() };
      await create(data);
      Toast.show({
        type: 'success',
        text1: 'Invoice Item saved successfully',
      });
      setItem(initialItem);
      onSuccess(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to create invoice item',
        text2: 'Please try again',
      });
    } finally {
      setLoading(false);
    }
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
          Create a new invoice Item
        </Text>
        <View style={styles.formInput}>
          <Text style={styles.label}>Item & Description</Text>
          <BottomSheetTextInput
            placeholderTextColor="#999"
            style={[
              styles.inputContainer,
              { height: 100, textAlignVertical: 'top', paddingVertical: 8 },
            ]}
            placeholder={'UI/UX Design\n10 pages design of cleaning website'}
            value={item.name}
            multiline
            onChangeText={text => {
              setItem({ ...item, name: text });
            }}
          />
        </View>
        <View style={styles.formInput}>
          <Text style={styles.label}>Price</Text>
          <BottomSheetTextInput
            placeholderTextColor="#999"
            style={styles.inputContainer}
            placeholder="500"
            keyboardType={'numeric'}
            value={item.price === 0 ? '' : item.price.toString()}
            onChangeText={text => {
              setItem({ ...item, price: text ? parseFloat(text) : 0 });
            }}
          />
        </View>

        <ButtonComponent
          title={'Save'}
          loading={loading}
          disabled={loading}
          onPress={saveItem}
        />
      </BottomSheetScrollView>
    </>
  );
};

export default CreateInvoiceItemBottomSheet;

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
