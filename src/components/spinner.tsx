import { BlurView } from '@react-native-community/blur';
import useDarkMode from 'hooks/use-dark-mode';
import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { styleSheetFactory, useTheme } from 'theme';

const Spinner = () => {
  const mode = useDarkMode();

  const { height, width } = Dimensions.get('screen');

  const [styles] = useTheme(Styles);

  const animationReference = useRef<LottieView>(null);

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        blurType={mode === 'light' ? 'xlight' : 'dark'}
        style={[styles.container, { width, height }]}
      >
        <View style={styles.spinner}>
          <LottieView
            autoPlay
            loop
            progress={1}
            ref={animationReference}
            resizeMode="cover"
            source={require('../assets/lottie/spinner.json')}
          />
        </View>
      </BlurView>
    );
  } else {
    const backgroundColor = getBackgroundColor(
      100,
      mode === 'light' ? 'light' : 'dark',
    );
    return (
      <View style={[styles.container, { width, height, backgroundColor }]}>
        <View style={styles.spinner}>
          <LottieView
            autoPlay
            loop
            ref={animationReference}
            resizeMode="cover"
            source={require('../assets/lottie/spinner.json')}
          />
        </View>
      </View>
    );
  }
};

export type BlurTint = 'light' | 'dark' | 'default';

function getBackgroundColor(intensity: number, tint: BlurTint): string {
  const opacity = intensity / 100;
  switch (tint) {
    case 'dark':
      return `rgba(25,25,25,${opacity * 0.78})`;
    case 'light':
      return `rgba(249,249,249,${opacity * 0.78})`;
    case 'default':
      return `rgba(255,255,255,${opacity * 0.3})`;
  }
}

const Styles = styleSheetFactory(() =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 80,
    },
    spinner: {
      alignSelf: 'center',
      height: 80,
      width: 80,
    },
  }),
);

export default Spinner;
