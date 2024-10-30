import { StatusBar, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { styleSheetFactory, useTheme } from 'theme';
import { Logo } from 'assets/svg/logo';
import auth from '@react-native-firebase/auth';
import { navigate } from 'navigation/navigation-helpers';

const SplashScreen = () => {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      setTimeout(() => {
        if (!user) {
          navigate('Onboarding');
        }
      }, 2000);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const [styles] = useTheme(Styles);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Logo />
    </View>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.background.alt,
      justifyContent: 'center',
      alignItems: 'center',
    },
  }),
);

export default SplashScreen;
