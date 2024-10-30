import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import { styleSheetFactory, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import { SearchIcon } from 'assets/svg/search';
import { ArrowRightIcon } from 'assets/svg/arrow-right';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

const OPTIONS = [
  {
    title: 'Privacy Policy',
    subtitle: 'Your agreed to our terms of use version',
    link: 'https://proceipt.com/privacy-policy',
  },
  {
    title: 'Terms of Service',
    subtitle: 'Your agreed to our terms of use version',
    link: 'https://proceipt.com/terms',
  },
];
export default function PrivacySettingsScreen() {
  const [styles] = useTheme(Styles);
  const { goBack } = useNavigation();

  const _handlePressButtonAsync = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable onPress={() => goBack()} style={styles.leftHeader}>
            <LeftArrow color="#333" />
            <Text style={styles.headerText}>Privacy</Text>
          </Pressable>
          <Pressable>
            <SearchIcon />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollviewContent}
          style={styles.scrollview}
        >
          {OPTIONS.map(x => (
            <Pressable
              onPress={() => _handlePressButtonAsync(x.link)}
              key={x.title}
              style={styles.item}
            >
              <View>
                <Text style={styles.itemTitle}>{x.title}</Text>
                <Text style={styles.itemSubtitle}>{x.subtitle}</Text>
              </View>
              <View style={styles.iconButton}>
                <ArrowRightIcon color="#5b5b5b" />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    errorText: {
      color: theme.colors.error.primary,
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },
    button: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.button.background,
      color: theme.colors.button.color,
      borderRadius: 14,
      minHeight: 55,
      width: '100%',
      marginTop: theme.spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      fontFamily: theme.font.regular,
      fontSize: 13,
      color: '#000',
    },
    innerView: {
      padding: '5%',
      backgroundColor: '#fff',
    },
    background: {
      backgroundColor: '#fff',
      borderRadius: 20,
    },
    item: {
      padding: theme.spacing.sm,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 0.5,
      borderColor: '#f2f2f2',
    },
    iconButton: {
      width: 30,
      height: 50,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.medium,
      fontSize: 16,
    },
    itemSubtitle: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 14,
    },
    scrollviewContent: {
      borderRadius: 15,
      overflow: 'hidden',
    },
    featuredItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    featuredItemText: {
      color: theme.colors.text.white,
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
    },
    featuredItemContainer: {
      width: '90%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'space-around',
      minHeight: 70,
      borderRadius: 20,
      backgroundColor: '#0032FA',
      position: 'absolute',
      top: -35,
      flexDirection: 'row',
      zIndex: 1000,
    },
    content: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f2f2f2',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      marginTop: theme.spacing.xxs,
      zIndex: 1000,
    },
    scrollview: {
      padding: theme.spacing.md,
    },
    profileContainer: {
      width: 110,
      height: 110,
      borderRadius: 110,
      borderWidth: 1,
      borderColor: theme.colors.text.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 100,
      backgroundColor: theme.colors.text.white,
    },
    container: {
      flex: 1,
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      padding: '5%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  }),
);
