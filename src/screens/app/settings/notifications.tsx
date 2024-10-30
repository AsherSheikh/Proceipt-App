import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import React from 'react';
import { styleSheetFactory, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import { SearchIcon } from 'assets/svg/search';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  getEnableEmail,
  isNotificationsEnabled,
  setEnableEmails,
  setEnableNotifications,
} from 'features/settings/settings-reducer';

const OPTIONS = [
  {
    title: 'Push Notifications',
    subtitle: 'Enabled',
    link: 'notification',
  },
  {
    title: 'Email Notifications',
    subtitle: 'Enabled',
    link: 'email',
  },
];
export default function NotificationSettingsScreen() {
  const [styles] = useTheme(Styles);
  const isEmailEnabled = useSelector(getEnableEmail);
  const notificationsEnabled = useSelector(isNotificationsEnabled);
  const dispatch = useDispatch();

  const { goBack } = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable onPress={() => goBack()} style={styles.leftHeader}>
            <LeftArrow color="#333" />
            <Text style={styles.headerText}>Notifications</Text>
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
            <View key={x.title} style={styles.item}>
              <View>
                <Text style={styles.itemTitle}>{x.title}</Text>
                <Text style={styles.itemSubtitle}>
                  {x.link === 'email'
                    ? isEmailEnabled
                      ? 'Enabled'
                      : 'Disabled'
                    : notificationsEnabled
                    ? 'Enabled'
                    : 'Disabled'}
                </Text>
              </View>
              <Switch
                ios_backgroundColor="rgba(0,15,72,0.1)"
                onValueChange={value => {
                  x.link === 'email'
                    ? dispatch(setEnableEmails(value))
                    : dispatch(setEnableNotifications(value));
                }}
                value={
                  x.link === 'email' ? isEmailEnabled : notificationsEnabled
                }
              />
            </View>
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
    label: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
    },
    buttonText: {
      fontFamily: theme.font.medium,
      color: theme.colors.button.color,
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
