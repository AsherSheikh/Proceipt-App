import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from 'theme';
import CloseIcon from 'assets/svg/close';
import { LightActiveIcon, LightInactiveIcon } from 'assets/svg/flash';
import { NavigationProp, RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParameterList } from 'navigation/navigator';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Toast from 'react-native-toast-message';
import { ScrollView } from 'react-native-gesture-handler';
import { LeftArrow } from 'assets/svg/left-arrow';
import { DownArrow } from 'assets/svg/down-arrow';
import { AddIcon } from 'assets/svg/add';
import { ItemDeleteIcon } from 'assets/svg/delete';
import * as Haptics from 'expo-haptics';
import { useDispatch, useSelector } from 'react-redux';
import { getImages, getShowPreview, setImages, setShowPreview } from 'features/scan/scan-reducer';
import { launchImageLibrary } from 'react-native-image-picker';
import { ImageIcon } from 'assets/svg/image';
import { shift, useFloating } from '@floating-ui/react-native';
import { getShowWalkthrough, setShowWalkthough } from 'features/settings/settings-reducer';

export const ScanScreen = () => {
  const [type] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const showWalkThrough = useSelector(getShowWalkthrough);
  const { params } = useRoute<RouteProp<RootStackParameterList, 'Scan'>>();

  const { x, y, reference, floating } = useFloating({
    placement: 'left',
    middleware: [shift()],
  });

  const dispatch = useDispatch();

  const images = useSelector(getImages);
  const showPreview = useSelector(getShowPreview);

  const onFlashPressed = useCallback(() => {
    setFlash(f => (f === 'off' ? 'on' : 'off'));
  }, []);

  const cameraRef = useRef<Camera>(null);

  const scrollRef = useRef<ScrollView>(null);

  const { goBack, navigate } =
    useNavigation<NavigationProp<RootStackParameterList>>();

  useEffect(() => {
    requestPermission().then(r => {
      console.log(r);
    });
  }, [requestPermission]);

  const isFocused = useIsFocused();

  const takePhoto = useCallback(async () => {
    const picture = await cameraRef.current?.takePictureAsync();

    if (picture?.uri && images.length <= 2) {
      const i = [...images, { uri: picture.uri, type: 'IMG' }];
      dispatch(setImages(i));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (i.length === 1) {
        dispatch(setShowPreview(true));
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Maximum number of photos are 3',
      });
    }
  }, [dispatch, images]);

  const onScanReceipt = () => {
    console.log('We are starting scanning !');
    navigate('UploadProgress', {
      receipts: images,
      folderId: params?.folderId,
    });
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  const onClose = () => goBack();

  const onChooseImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
      });

      const asset = result?.assets?.[0];

      if (asset?.uri) {
        setTimeout(() => {
          navigate('Scan', {
            folderId: params?.folderId,
          });
          dispatch(setShowPreview(true));
          dispatch(setImages([...images, { uri: asset.uri, type: 'IMG' }]));
        }, 500);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        {permission && isFocused && (
          <Camera
            ratio="16:9"
            barCodeScannerSettings={{
              barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
            }}
            onBarCodeScanned={x => console.log(x)}
            style={styles.camera}
            flashMode={flash === 'on' ? FlashMode.on : FlashMode.off}
            type={type}
            ref={cameraRef}
          />
        )}
      </View>

      <View
        style={{
          width: '100%',
          height: 160,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          position: 'absolute',
        }}
      />

      <View style={styles.leftButtonRow}>
        <Pressable onPress={onFlashPressed} style={styles.button}>
          {flash === 'on' ? <LightActiveIcon /> : <LightInactiveIcon />}
        </Pressable>
      </View>

      <View style={styles.rightButtonRow}>
        <Pressable onPress={onChooseImage} style={styles.button}>
          <ImageIcon />
        </Pressable>
      </View>

      <View style={styles.bottom}>
        <Pressable onPress={onClose} style={styles.button}>
          <CloseIcon color="#fff" />
        </Pressable>

        <View style={styles.captureButton}>
          <Pressable onPress={() => takePhoto()} style={styles.innerButton} />
        </View>

        {images.length > 0 ? (
          <Pressable onPress={() => dispatch(setShowPreview(true))}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        ) : (
          <View style={styles.invisible} />
        )}
      </View>

      {showPreview && (
        <>
          <ScrollView
            ref={scrollRef}
            pagingEnabled={true}
            horizontal
            style={styles.preview}
            onScroll={event => {
              const xOffset = event.nativeEvent.contentOffset.x;
              setActiveImgIndex(Math.max(xOffset / width));
            }}
            scrollEventThrottle={4}
          >
            {images.map((x, i) => (
                <Image
                  resizeMode="cover"
                  source={{ uri: x.uri }}
                  key={i}
                  style={styles.previewItem}
                />
            ))}
          </ScrollView>

          <View
            style={{
              width: '100%',
              height: 240,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              position: 'absolute',
            }}
          />

          <View style={styles.bottomNew}>
            <Pressable
              onPress={() => dispatch(setShowPreview(false))}
              style={styles.button}
            >
              <LeftArrow color="#fff" />
            </Pressable>

            <Pressable
              onPress={() => onScanReceipt()}
              style={styles.buttonList}
            >
              <Text style={styles.done}>Scan Receipt</Text>
              <View style={styles.buttonFilled}>
                <DownArrow />
              </View>
            </Pressable>
          </View>

          <View style={styles.leftButtonRow}>
            <Pressable style={styles.buttonList}>
              <Text style={styles.heading}>Scan Receipt</Text>
            </Pressable>
          </View>

          <View style={styles.rightButtonRow}>
            <Pressable
              onPress={() => {
                const z = images.filter((_i, a) => a !== activeImgIndex);
                dispatch(setImages(z));
                z.length === 0 && dispatch(setShowPreview(false));
              }}
              style={styles.buttonList}
            >
              <Text style={styles.heading}>
                <ItemDeleteIcon />
              </Text>
            </Pressable>
          </View>
          <View style={styles.bottomUpper}>
            <View style={styles.previewList}>
              {images.map((x, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    scrollRef?.current?.scrollTo({
                      y: 0,
                      x: width * i,
                      animated: true,
                    })
                  }
                >
                  <Image
                    source={{ uri: x.uri }}
                    key={i}
                    resizeMode="cover"
                    style={styles.smallPreviewItem}
                  />
                </Pressable>
              ))}
            </View>
            <Pressable
              ref={reference}
              collapsable={false}
              onPress={() => {
                dispatch(setShowPreview(false));
              }}
              style={styles.buttomAdd}
            >
              <AddIcon />
            </Pressable>
            {(showWalkThrough || showWalkThrough === undefined) && (
              <View
                ref={floating}
                collapsable={false}
                style={{
                  position: 'absolute',
                  top: (y ?? 0) - 10,
                  left: (x ?? 0) + -20 ?? 0,
                  maxWidth: 250,
                  borderRadius: 5,
                  minHeight: 100,
                  justifyContent: 'center',
                  backgroundColor: '#0068FC',
                  paddingHorizontal: 15,
                }}
              >
                <Text
                  style={{ color: 'white', fontFamily: theme.font.regular }}
                >
                  Does your receipt have more pages? Tap on the + button to add
                  an extra page
                </Text>
                <Pressable onPress={() => dispatch(setShowWalkthough(false))}>
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: theme.font.bold,
                      marginTop: 10,
                      paddingBottom: 10,
                    }}
                  >
                    Got it
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const CAPTURE_BUTTON_SIZE = 58;
const BORDER_WIDTH = CAPTURE_BUTTON_SIZE * 0.05;
const BUTTON_SIZE = 40;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  heading: {
    color: 'rgba(255,255,255, 0.7)',
  },
  previewList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallPreviewItem: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  preview: {
    flex: 1,
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
  },
  previewItem: {
    flex: 1,
    top: 0,
    width,
    height,
    backgroundColor: '#111',
  },
  previewItem2: {
    flex: 1,
    top: 0,
    width,
    height,
    backgroundColor: '#ddd',
  },
  done: {
    color: theme.colors.text.white,
    fontFamily: theme.font.semibold,
    fontSize: 16,
    textAlign: 'right',
  },

  bottomUpper: {
    bottom: 140,
    justifyContent: 'space-between',
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  buttomAdd: {
    borderRadius: 15,
    width: 40,
    height: 40,
    borderColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    bottom: 70,
    justifyContent: 'space-around',
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  bottomNew: {
    bottom: 70,
    justifyContent: 'space-between',
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  innerButton: {
    backgroundColor: theme.colors.text.white,
    borderRadius: 65,
    height: 45,
    width: 45,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255, 0.2)',
    borderRadius: BUTTON_SIZE / 2,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    width: BUTTON_SIZE,
  },
  buttonList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonFilled: {
    alignItems: 'center',
    backgroundColor: '#2244CD',
    borderRadius: BUTTON_SIZE / 2,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    width: BUTTON_SIZE,
    marginLeft: Platform.OS === 'android' ? 10 : 20,
    transform: [{ rotate: '180deg' }],
  },
  invisible: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255, 0)',
    borderRadius: BUTTON_SIZE / 2,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    width: BUTTON_SIZE,
  },
  captureButton: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: theme.colors.text.white,
    borderRadius: CAPTURE_BUTTON_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    height: CAPTURE_BUTTON_SIZE,
    width: CAPTURE_BUTTON_SIZE,
    zIndex: 1,
    justifyContent: 'center',
  },
  leftButtonRow: {
    left: 20,
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
  },
  rightButtonRow: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'android' ? 40 : 60,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  wrapper: {
    padding: '5%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  camera: {
    flex: 1,
    width,
    height,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcon: {
    flexDirection: 'row',
    backgroundColor: theme.colors.text.white,
    borderRadius: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
