import { NavigationProp, RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useScanReceiptMutation } from 'features/receipt/receipt-reducer';
import { RootStackParameterList } from 'navigation/navigator';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { styleSheetFactory, useTheme } from 'theme';
import { OrganisationFolder, Receipt } from 'utils/type';
import Toast from 'react-native-toast-message';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { setImages, setShowPreview } from 'features/scan/scan-reducer';
import { useDispatch } from 'react-redux';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';

export const UploadProgressScreen = () => {
  const { params } =
    useRoute<RouteProp<RootStackParameterList, 'UploadProgress'>>();

  const isFocus = useIsFocused();

  const { replace, goBack } = useNavigation<
    NavigationProp<RootStackParameterList> & {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      replace<RouteName extends keyof RootStackParameterList>(
        receiptDetails: string,
        params: {
          receipt: Receipt;
          folderId: string | undefined;
        },
      ): unknown;
    }
  >();

  const dispatch = useDispatch();

  const [scanReceipt, { isSuccess, isError, data }] = useScanReceiptMutation();

  const handleUpload = useCallback(async () => {
    try {
      if (params.receipts && scanReceipt) {
        const receipts: string[] = [];

        for (let index = 0; index < params.receipts.length; index++) {
          const element = params.receipts[index];

          if (element.type === 'IMG') {
            const response = await manipulateAsync(element.uri, [], {
              compress: 0.5,
              format: SaveFormat.JPEG,
              base64: true,
            });
            response?.base64 && receipts.push(response.base64);
          }

          if (element.type === 'PDF') {
            const b64 = await RNFS.readFile(element.uri, 'base64');
            b64 && receipts.push(b64);
          }
        }
        scanReceipt({ receipts, folderId: params.folderId });
      }
    } catch {
      Toast.show({
        type: 'success',
        text1: 'Error',
        text2:
          'Error! Your receipt might be saved anyway. Check is at receipts and edit the total',
      });
      goBack();
    }
  }, [params, scanReceipt, goBack]);

  useEffect(() => {
    if (params.receipts) {
      handleUpload();
    }
  }, [handleUpload, params.receipts, scanReceipt]);

  useEffect(() => {
    if (isError) {
      Toast.show({
        type: 'success',
        text1: 'Error',
        text2:
          'Error! Your receipt might be saved anyway. Check is at receipts and edit the total',
      });
      goBack();
    }
    if (isSuccess) {
      if (params?.folderId) {
        console.log(params.folderId);
        // Save receipt to organisation folder
        const folderRef = firestore()
          .collection('folders-test')
          .doc(params.folderId);
        folderRef
          .get()
          .then(doc => {
            if (doc.exists) {
              const results = doc.data() as OrganisationFolder;
              const id = new Date().getTime();
              const receipts = [...results.receipts, { ...data, id, uploadedAt:new Date()}];
              folderRef
                .update({
                  receipts: receipts,
                })
                .then(_ => {
                  replace('ReceiptDetails', {
                    receipt: { ...data, id } as Receipt,
                    folderId: doc.id,
                  });
                  dispatch(setImages([]));
                  dispatch(setShowPreview(false));
                  Toast.show({
                    type: 'success',
                    text1: 'Saved Receipt',
                  });
                })
                .catch(error => {
                  Toast.show({
                    type: 'error',
                    text1: 'Error saving receipts',
                    text2: error,
                  });
                });
            } else {
              dispatch(setImages([]));
              dispatch(setShowPreview(false));
              Toast.show({
                type: 'error',
                text1: 'Error saving receipts',
              });
              goBack();
            }
          })
          .catch(error => {
            Toast.show({
              type: 'error',
              text1: 'Error saving receipts',
              text2: error,
            });
            console.log('Error getting document from scanning:', error);
            goBack();
          });
      } else {
        replace('ReceiptDetails', {
          receipt: data as Receipt,
          folderId: params.folderId,
        });
        dispatch(setImages([]));
        dispatch(setShowPreview(false));
        Toast.show({
          type: 'success',
          text1: 'Receipt Saved',
        });
      }
    }
    /// ts-ignore
  }, [isError, isSuccess, data, params, goBack, replace, dispatch]);

  const [styles] = useTheme(Styles);

  if (isFocus) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <LottieView
            autoPlay
            loop
            resizeMode="contain"
            source={require('../../../assets/lottie/scanning.json')}
          />
        </View>
        <Text style={styles.text}>Scanning Image</Text>
      </View>
    );
  }
  return null;
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      fontSize: 16,
    },
    successContainer: {
      alignSelf: 'center',
      bottom: 30,
      height: 150,
      position: 'relative',
      width: 150,
    },
  }),
);
