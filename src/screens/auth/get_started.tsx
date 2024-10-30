import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { styleSheetFactory, theme, useTheme } from '../../theme';
import { GoogleIcon } from '../../assets/svg/google';
import { AppleIcon } from '../../assets/svg/apple';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParameterList } from '../../navigation/navigator';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import { useOnboardUserMutation } from '../../features/authentication/authentication-reducer';

const GetStarted = () => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [styles] = useTheme(Styles);
  const { navigate } = useNavigation<NavigationProp<AuthStackParameterList>>();
  const [onboard, {}] = useOnboardUserMutation();

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
        '236766359073-13eqlhfbn46ncd0j81eeh2f7om1d9vdo.apps.googleusercontent.com',
      webClientId:
        '236766359073-fb465bk6unqb4raj69c3hjldo9frn79c.apps.googleusercontent.com',
    });
  }, []);

  async function onAppleButtonPress() {
    try {
      setLoading(true);
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        Alert.alert('Apple', 'Sign in with apple failed');
        setLoading(false);
      }

      // Create a Firebase credential from the response
      const { identityToken, nonce, fullName } = appleAuthRequestResponse;
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      await auth().signInWithCredential(appleCredential);
      await auth().currentUser?.updateProfile({
        displayName: fullName?.givenName || fullName?.middleName || 'User',
      });
      await onboard({
        username: fullName?.givenName || fullName?.middleName || 'User',
        country: 'United Kingdom',
      }).unwrap();
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function onGoogleButtonPress() {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const credential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(credential);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('operation (e.g. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('play services not available or outdated');
      } else {
        console.log(error);
      }
    }
  }
  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        backgroundColor: theme.colors.background.primary,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View
        style={{
          height: height * 0.35,
        }}
      >
        <Image
          source={require('../../assets/images/onboard.png')}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />
      </View>
      <ScrollView>
        <View
          style={{
            flex: 1,
            padding: 25,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
            }}
          >
            <Text
              style={{
                marginBottom: 30,
                fontFamily: theme.font.semibold,
                color: theme.colors.text.primary,
                fontSize: 20,
                textAlign: 'center',
              }}
            >
              Sign up to send invoices and manage expenses receipts with ease!
            </Text>
          </View>
          <TouchableOpacity
            disabled={loading}
            style={[styles.outlineBtn]}
            onPress={() => navigate('Signup')}
          >
            <Text
              style={{
                marginLeft: 10,
                fontFamily: theme.font.semibold,
                color: theme.colors.text.primary,
              }}
            >
              Sign Up With Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={loading}
            style={[styles.outlineBtn, { marginVertical: 15 }]}
            onPress={() => navigate('Login')}
          >
            <Text
              style={{
                marginLeft: 10,
                fontFamily: theme.font.semibold,
                color: theme.colors.text.primary,
              }}
            >
              Login With Email
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <View style={styles.continueContainer}>
              <Text style={styles.continueText}>OR</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onGoogleButtonPress}
            disabled={loading}
            style={[styles.primaryBtn]}
          >
            <GoogleIcon />
            <Text
              style={{
                color: '#fff',
                fontFamily: theme.font.semibold,
                marginLeft: 10,
              }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              disabled={loading}
              onPress={onAppleButtonPress}
              style={[styles.outlineBtn, { marginTop: 15 }]}
            >
              <AppleIcon />
              <Text
                style={{
                  marginLeft: 10,
                  fontFamily: theme.font.semibold,
                }}
              >
                Continue with Apple
              </Text>
            </TouchableOpacity>
          )}
          <View
            style={{
              maxWidth: '80%',
              alignSelf: 'center',
              marginVertical: 25,
            }}
          >
            <Text style={styles.privacy}>
              By creating account, you agree to our{' '}
              <Text onPress={() => {}} style={styles.privacyMain}>
                Privacy Policy{' '}
              </Text>
              and{' '}
              <Text onPress={() => {}} style={styles.privacyMain}>
                Terms of Service
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default GetStarted;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    title: {
      fontFamily: theme.font.bold,
      fontSize: 18,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
      color: theme.colors.text.darkGrey,
    },
    privacy: {
      fontFamily: theme.font.regular,
      fontSize: 14,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
      color: theme.colors.text.dark,
    },
    privacyMain: {
      color: theme.colors.text.main,
    },
    primaryBtn: {
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.text.main,
      padding: 14,
    },
    outlineBtn: {
      borderRadius: 12,
      width: '100%',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.divider,
      color: theme.colors.text.primary,
      backgroundColor: '#e8e8ee',
      padding: 14,
    },
    continueText: {
      fontFamily: theme.font.regular,
      fontSize: 13,
      color: theme.colors.text.dark,
    },
    divider: {
      position: 'absolute',
      width: '100%',
      height: 1,
      backgroundColor: theme.colors.divider,
    },
    dividerContainer: {
      position: 'relative',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.lg,
    },
    continueContainer: {
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.md,
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.text.dark,
      fontFamily: theme.font.medium,
      textAlign: 'center',
    },
    footerTextHighlight: {
      fontSize: 14,
      color: theme.colors.text.main,
      fontFamily: theme.font.medium,
      textAlign: 'center',
    },
  }),
);
