import { styleSheetFactory, useTheme } from '../theme';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeftArrow } from '../assets/svg/left-arrow';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from '../navigation/navigator';
import { Platform } from 'react-native';

export const AppBar = ({
  title,
  showBack = true,
}: {
  title: string;
  showBack?: boolean;
}) => {
  const insets = useSafeAreaInsets();

  const { goBack } = useNavigation<NavigationProp<RootStackParameterList>>();
  const [styles] = useTheme(Styles);
  return (
    <>
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <View style={[styles.header]}>
          {showBack && (
            <Pressable onPress={() => goBack()}>
              <LeftArrow color="#000" />
            </Pressable>
          )}
          <View style={[styles.leftHeader, { marginHorizontal: 10 }]}>
            <Text style={styles.headerText}>{title}</Text>
          </View>
        </View>
      </View>
    </>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    itemHeader: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    inputHorizontalContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
    },
    inputHorizontalItem: {
      width: '48%',
    },
    buttonText: {
      fontFamily: theme.font.medium,
      color: theme.colors.button.color,
    },
    button: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.button.background,
      color: theme.colors.button.color,
      borderRadius: 14,
      minHeight: 55,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.dark,
    },
    itemLabel: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.dark,
    },
    input: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
      fontSize: 14,
      ...(Platform.OS === 'ios' && {
        height: 30,
      }),
    },
    modal: {
      padding: theme.spacing.sm,
      paddingHorizontal: '5%',
      paddingBottom: theme.spacing.xxl,
    },
    folderContent: {
      marginLeft: theme.spacing.md,
    },
    subtitle: {
      color: theme.colors.text.light,
      fontFamily: theme.font.regular,
    },
    largeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '100%',
      backgroundColor: theme.colors.card.background,
      borderRadius: 15,
      marginBottom: theme.spacing.lg,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      marginBottom: theme.spacing.xxs,
      fontSize: 16,
    },
    subheaderTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.semibold,
      fontSize: 22,
      marginTop: theme.spacing.lg,
    },
    subheaderSubtitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.medium,
      fontSize: 14,
    },
    pen: {
      marginRight: theme.spacing.md,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    item: {
      padding: theme.spacing.md,
      backgroundColor: 'rgba(0,15,72,0.05)',
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    iconButton: {
      width: 50,
      height: 50,
      backgroundColor: 'rgba(0,15,72,0.1)',
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
      paddingTop: 180,
      paddingBottom: 40,
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
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      zIndex: 1000,
    },
    scrollview: {
      padding: theme.spacing.md,
      height: Dimensions.get('window').height * 0.7,
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
      backgroundColor: '#f5f5f5',
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      height: Platform.OS === 'ios' ? '12%' : '10%',
      backgroundColor: '#fff',
      padding: '5%',
      paddingTop: theme.spacing.xxl,
      position: 'absolute',
      width: '100%',
      zIndex: 99999999,
    },
    header: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
    },
    metaContainer: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      padding: theme.spacing.md,
      borderRadius: 10,
      width: '100%',
      maxHeight: 120,
      overflow: 'hidden',
    },
    totalContainer: {
      padding: theme.spacing.sm,
    },
    id: {
      color: '#333333',
      fontFamily: theme.font.semibold,
      fontSize: 15,
    },
    labelId: {
      color: '#333333',
      fontFamily: theme.font.regular,
      fontSize: 13,
      marginBottom: theme.spacing.xxs,
    },
    address: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 13,
    },
    totalHeading: {
      color: '#333333',
      fontFamily: theme.font.regular,
      fontSize: 13,
      marginBottom: theme.spacing.xxs,
    },
    totalAmount: {
      color: '#333',
      fontFamily: theme.font.semibold,
      fontSize: 28,
    },
    tableTitle: {
      color: '#333',
      fontFamily: theme.font.semibold,
      fontSize: 14,
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: 10,
    },
    table: {
      marginTop: theme.spacing.lg,
      borderRadius: 10,
      backgroundColor: '#fff',
    },
    tableItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    tableItemTitle: {
      color: '#333333',
      fontFamily: theme.font.medium,
      fontSize: 14,
    },
    tableItemCost: {
      color: '#333333',
      fontFamily: theme.font.semibold,
      fontSize: 14,
    },
    tableItemTitleTotal: {
      color: '#333333',
      fontFamily: theme.font.medium,
      fontSize: 18,
    },
    tableItemCostTotal: {
      color: '#333333',
      fontFamily: theme.font.semibold,
      fontSize: 24,
    },
    metaLeft: {
      width: '50%',
    },
    metaRight: {
      width: '50%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderLeftWidth: 0.5,
      borderLeftColor: 'rgba(0,0,0,0.1)',
    },

    sectionTitle: {
      color: '#000',
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginBottom: theme.spacing.xs,
    },
    receipt: {
      width: '100%',
      height: 400,
      borderRadius: 10,
      marginTop: theme.spacing.sm,
      backgroundColor: '#f2f2f2',
    },
  }),
);
