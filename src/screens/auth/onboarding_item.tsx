import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { OnboardingData } from '../../utils/type';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import React from 'react';
import LottieView from 'lottie-react-native';

type Props = {
  item: OnboardingData;
  onContinuePress: () => void;
};
const OnboardingItem = ({ item, onContinuePress }: Props) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        width,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        <LottieView
          autoPlay
          loop
          resizeMode="contain"
          source={item.lottie as any}
        />
      </View>
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 10 }]}>
        <Text style={styles.bottomSheetTitle}>{item.title}</Text>
        <Text style={styles.bottomSheetText}>{item.text}</Text>
        <View
          style={{
            flex: 1,
          }}
        />
        <Pressable style={styles.continueBtn} onPress={onContinuePress}>
          <Text
            style={{
              color: '#fff',
              fontFamily: theme.font.medium,
              fontSize: 16,
            }}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OnboardingItem;

const styles = StyleSheet.create({
  bottomSheet: {
    height: 215,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E9E9',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    padding: 20,
    paddingHorizontal: 30,
  },
  bottomSheetTitle: {
    fontFamily: theme.font.bold,
    fontSize: 26,
    color: '#26263f',
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomSheetText: {
    fontFamily: theme.font.regular,
    fontSize: 15,
    textAlign: 'center',
    color: '#4d4d4d',
    marginBottom: 8,
  },
  continueBtn: {
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    backgroundColor: theme.colors.text.main,
    padding: 14,
  },
});
