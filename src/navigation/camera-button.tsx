import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AddTabIcon } from 'assets/svg/addTab';
import { ImageIcon } from 'assets/svg/image';
import { PdfIcon } from 'assets/svg/pdf';
import { ScanTab } from 'assets/svg/scanTab';
import { setImages, setShowPreview } from 'features/scan/scan-reducer';
import { pickSingle, types } from 'react-native-document-picker';
import React from 'react';

import {
  Animated,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { theme } from 'theme';
import { RootStackParameterList } from './navigator';
import { useReadUserQuery } from '../features/profile/profile-reducer';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';

const CameraButton = ({
  opened = false,
  toggleOpened,
  folderId,
}: {
  folderId?: string;
  opened: boolean;
  toggleOpened: () => void;
}) => {
  const animation = React.useRef(new Animated.Value(0)).current;
  const { data, refetch: userRefetch } = useReadUserQuery();
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();

  const dispatch = useDispatch();

  const handleBillingThreshold = callbackFunc => {
    const getLatestSession = async (): Promise<boolean> => {
      if (!data) {
        return false;
      }
      // Get the 'customer_session' subcollection reference
      const customerSubscriptionRef = firestore()
        .collection('customers')
        .doc(data.id)
        .collection('subscriptions');

      const customerSessionData = await customerSubscriptionRef.get();

      if (customerSessionData.empty) {
        return false;
      }

      // Get the latest customer session document by ordering the documents in
      // the subcollection by the 'createdAt' field in descending order and
      // limiting the result to 1 document
      const q = customerSubscriptionRef.orderBy('created', 'desc').limit(1);
      const querySnapshot = await q.get();
      const latestSessionData = querySnapshot.docs[0]?.data();
      return (
        latestSessionData.status === 'active' ||
        latestSessionData.status === 'trialing'
      );
    };

    getLatestSession().then(status => {
      if (data && data.scans >= 1 && !folderId && !status) {
        Toast.show({
          type: 'error',
          text1: 'Please, subscribe to a billing plan to upload more receipts',
        });
        navigate('Billing', {
          scansThreHold: true,
        });
      } else {
        callbackFunc();
      }
    });
  };
  React.useEffect(() => {
    userRefetch();
  }, [userRefetch]);

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: opened ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [opened, animation]);

  const opacity = {
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }),
  };
  const onPickFile = async () => {
    try {
      const pickerResult = await pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
        type: types.pdf,
      });

      if (pickerResult?.uri) {
        dispatch(setShowPreview(true));
        dispatch(setImages([{ uri: pickerResult.uri, type: 'PDF' }]));
        setTimeout(() => {
          navigate('UploadProgress', {
            folderId,
            receipts: [{ uri: pickerResult.uri, type: 'PDF' }],
          });
          toggleOpened();
        }, 500);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onChooseImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
      });

      const asset = result?.assets?.[0];

      if (asset?.uri) {
        setTimeout(() => {
          navigate('Scan', {
            folderId,
          });
          toggleOpened();
          dispatch(setShowPreview(true));
          dispatch(setImages([{ uri: asset.uri, type: 'IMG' }]));
        }, 500);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <TouchableWithoutFeedback
          onPress={() => handleBillingThreshold(onPickFile)}
        >
          <Animated.View
            style={[
              styles.item,
              opacity,
              {
                transform: [
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -80],
                    }),
                  },
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              },
              { backgroundColor: '#367CC9' },
            ]}
          >
            <PdfIcon />
            <Text style={styles.label}>Document</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => {
            toggleOpened();
            /** @ts-ignore */
            handleBillingThreshold(() => {
              navigate('Scan', { folderId });
            });
          }}
        >
          <Animated.View
            style={[
              styles.item,
              opacity,
              {
                transform: [
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 10],
                    }),
                  },
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -80],
                    }),
                  },
                ],
              },
              { backgroundColor: '#ffa000' },
            ]}
          >
            <ScanTab />
            <Text style={styles.label}>Camera</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => handleBillingThreshold(onChooseImage)}
        >
          <Animated.View
            style={[
              styles.item,
              opacity,
              {
                transform: [
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -60],
                    }),
                  },
                  {
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -70],
                    }),
                  },
                ],
              },

              { backgroundColor: '#e0523C' },
            ]}
          >
            <ImageIcon />
            <Text style={styles.label}>Photos</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={toggleOpened}
          style={styles.addButton}
        >
          <Animated.View
            style={[
              styles.addButtonInner,
              {
                transform: [
                  {
                    rotate: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '-45deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View>
              <AddTabIcon />
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    height: 0,
  },
  box: {
    position: 'relative',
    width: 60,
    height: 60,
    right: 10,
    marginTop: -80,
  },
  addButton: {
    shadowColor: theme.colors.grey.dark,
    shadowOpacity: 0.3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  addButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0068FC',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.62,
    elevation: 8,
  },
  addButtonIcon: {
    tintColor: theme.colors.text.white,
  },
  item: {
    position: 'absolute',
    top: 5,
    left: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0068FC',
    width: 55,
    height: 55,
    borderRadius: 30,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5.62,
    elevation: 8,
  },
  itemIcon: {
    width: 32,
    height: 32,
    tintColor: theme.colors.text.white,
  },
  label: {
    fontFamily: theme.font.medium,
    fontSize: 8,
    color: '#fff',
  },
});

export default CameraButton;
