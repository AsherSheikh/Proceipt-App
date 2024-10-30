import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { styleSheetFactory, theme, useTheme } from 'theme';
import { AltReceipt, GridReceipt } from 'components/receipt';
import { AddFolder, Folder, GridFolder } from 'components/folder';
import { getUser, useReadUserQuery } from 'features/profile/profile-reducer';
import { useReadFoldersQuery } from 'features/folder/folder-reducer';
import { useReadReceiptsQuery } from 'features/receipt/receipt-reducer';
import { toFormattedDate } from 'utils/date';
import {
  NavigationProp,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import { RootStackParameterList } from 'navigation/navigator';
import { SettingsIcon } from 'assets/svg/settings';
import { NotificationIcon } from 'assets/svg/notification';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { GridIcon } from 'assets/svg/grid';
import { useTabMenu } from '../../context/tab-context';
import { useSelector } from 'react-redux';
import { useReadAllNotificationsQuery } from 'features/notification/notification-reducer';
import { DefaultProfilePhoto } from 'utils/constants';

export default function HomeScreen() {
  const [styles] = useTheme(Styles);

  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();
  const [isGrid, setIsGrid] = useState(false);

  const { data, refetch: userRefetch } = useReadUserQuery();
  const { data: notifications, refetch: notificationsRefetch } =
    useReadAllNotificationsQuery();
  const { data: folders, refetch: folderRefetch } = useReadFoldersQuery();
  const { data: receipts, refetch: receiptRefetch } = useReadReceiptsQuery();

  const isFocused = useIsFocused();

  const userData = useSelector(getUser);

  const toggleGrid = () => setIsGrid(!isGrid);

  const { toggleOpened } = useTabMenu();

  useEffect(() => {
    userRefetch();
    folderRefetch();
    receiptRefetch();
    notificationsRefetch();
  }, [
    folderRefetch,
    isFocused,
    receiptRefetch,
    userRefetch,
    notificationsRefetch,
  ]);

  const newNotification = notifications?.filter(x => x.status === 'NEW')
    ?.length;

  function displayName() {
    const name = data?.name?.split(' ')[0];
    const username = data?.username?.split(' ')[0];
    const emailName = data?.email?.split('@')[0];
    if (name) return name;
    if (username) return username;
    if (emailName) return emailName;
    return '';
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={'transparent'} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
        style={styles.wrapper}
      >
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Image
              source={{ uri: data?.photoUrl ?? DefaultProfilePhoto }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.subtitle}>Hello,</Text>
              <Text style={styles.name}>{displayName()}</Text>
            </View>
          </View>
          <View style={styles.rightHeader}>
            <TouchableOpacity
              onPress={() => navigate('Notification')}
              style={styles.iconContainer}
            >
              <NotificationIcon />
              {Boolean(newNotification) && (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 3,
                    borderColor: '#fff',
                    borderRadius: 60,
                    backgroundColor: theme.colors.error.primary,
                    position: 'absolute',
                    top: -2.5,
                    right: -2.5,
                  }}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigate('Profile')}
              style={styles.iconContainer}
            >
              <SettingsIcon color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <Image
            resizeMode="cover"
            resizeMethod="resize"
            source={require('../../assets/images/background.png')}
            style={{
              height: 290,
              width: '110%',
              left: -20,
              position: 'absolute',
            }}
          />
          <View>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Total</Text>
              <Text style={styles.chartSubtitle}>
                {`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(data?.total || 0)}`}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.folderHeader}>
          <Text style={styles.modalTitle}>Recents </Text>
          <TouchableOpacity onPress={toggleGrid}>
            <GridIcon color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.folderHeader}>
          <Text style={styles.modalSubtitle}>Folders </Text>
          {/** @ts-ignore */}
          <TouchableOpacity onPress={() => navigate('Folder')}>
            <Text style={styles.modalSubtitleLink}>See All </Text>
          </TouchableOpacity>
        </View>

        {!folders?.length && (
          <AddFolder
            color="#5BAD09"
            title="Tap to add a new folder"
            // @ts-ignore
            onPress={() => navigate('Folder', { action: 'createFolder' })}
          />
        )}
        <View
          style={{
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {folders?.slice(0, 3).map(x => {
            return isGrid ? (
              <GridFolder
                icon={x.icon as string}
                key={x.id}
                color={x.color}
                title={x.name}
                amount={`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(x.total || 0)}`}
                subtitle={`${toFormattedDate(x.createdAt)}`}
                onPress={() => navigate('FolderDetails', x)}
              />
            ) : (
              <Folder
                amount={`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(x.total || 0)}`}
                icon={x.icon as string}
                key={x.id}
                color={x.color}
                title={x.name}
                subtitle={`${toFormattedDate(x.createdAt)}`}
                onPress={() => navigate('FolderDetails', x)}
              />
            );
          })}
        </View>

        <View style={styles.folderHeader}>
          <Text style={styles.modalSubtitle}>Receipts</Text>
          {/** @ts-ignore */}
          <TouchableOpacity onPress={() => navigate('Receipt')}>
            <Text style={styles.modalSubtitleLink}>See All </Text>
          </TouchableOpacity>
        </View>

        {!receipts?.length && (
          <AddFolder
            color="#5BAD09"
            title="Tap to add a new receipt"
            isReceipt={true}
            onPress={() => toggleOpened()}
          />
        )}

        <View
          style={{
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {[...(receipts ?? [])].slice(0, 3)?.map(x => {
            return isGrid ? (
              <GridReceipt
                key={x.id}
                title={x.name}
                subtitle={toFormattedDate(x.createdAt)}
                onPress={() => navigate('ReceiptDetails', { receipt: x })}
                total={`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(parseFloat(x.total || '0'))}`}
              />
            ) : (
              <AltReceipt
                key={x.id}
                title={x.name}
                subtitle={toFormattedDate(x.createdAt)}
                onPress={() => navigate('ReceiptDetails', { receipt: x })}
                total={`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(parseFloat(x.total || '0'))}`}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// eslint-disable-next-line @typescript-eslint/no-shadow
const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    barChart: {
      padding: theme.spacing.xs,
    },
    chartContainer: {
      paddingVertical: theme.spacing.lg,
      backgroundColor: '#004CBB',
      borderRadius: 12,
      marginVertical: 25,
      overflow: 'hidden',
    },
    chartTitle: {
      color: theme.colors.text.white,
      fontFamily: theme.font.regular,
      fontSize: 12,
    },
    chartHeader: {
      padding: theme.spacing.sm,
    },
    chartSubtitle: {
      color: theme.colors.text.white,
      fontFamily: theme.font.bold,
      fontSize: 22,
      marginTop: theme.spacing.xs,
    },
    contentContainer: {
      backgroundColor: 'white',
      height: 50,
    },
    scrollview: {
      height: 100,
    },
    itemContainer: {
      padding: 6,
      margin: 6,
      backgroundColor: '#eee',
    },
    background: {
      borderRadius: 25,
      backgroundColor: '#F8F9FD',
    },
    modalContainer: {
      marginHorizontal: theme.spacing.md,
    },
    modalTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.semibold,
      fontSize: 16,
    },
    card: {
      height: 80,
      width: 180,
      marginRight: 20,
      backgroundColor: theme.colors.card.background,
    },
    modalSubtitle: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.medium,
      fontSize: 13,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    modalSubtitleLink: {
      color: theme.colors.text.main,
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    container: {
      flex: 1,
    },
    wrapper: {
      flex: 1,
      backgroundColor: '#f3f3f3',
      padding: '5%',
    },
    leftHeader: {
      maxWidth: '50%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      backgroundColor: '#ffffff',
      width: 50,
      height: 50,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    subtitle: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.regular,
      fontSize: 14,
    },
    name: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      marginTop: 2,
      fontSize: 20,
      textTransform: 'capitalize',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.background.primary,
      marginRight: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    folderHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xxs,
    },
  }),
);
