import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import { styleSheetFactory, theme, useTheme } from 'theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParameterList } from 'navigation/navigator';
import { LeftArrow } from 'assets/svg/left-arrow';
import { Notification } from 'components/notification';
import {
  useMarkAsReadMutation,
  useReadAllNotificationsQuery,
} from 'features/notification/notification-reducer';
import NoReceiptIcon from 'assets/svg/no-receipt';
import { FlatList } from 'react-native-gesture-handler';

export default function NotificationScreen() {
  const [styles] = useTheme(Styles);

  const { navigate, goBack } =
    useNavigation<NavigationProp<RootStackParameterList>>();

  const { data, refetch } = useReadAllNotificationsQuery();

  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable onPress={() => goBack()} style={styles.leftHeader}>
            <LeftArrow color={theme.colors.text.darkGrey} />
            <Text style={styles.headerText}>Notifications</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {!data?.length ? (
          <View style={styles.emptyContainer}>
            <NoReceiptIcon />
            <Text style={styles.emptyTitle}>No notifications</Text>
          </View>
        ) : (
          <FlatList
            style={styles.scrollview}
            data={[...data]?.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )}
            ListFooterComponent={<View style={{ height: 50 }} />}
            renderItem={({ item: x }) => (
              <Notification
                item={x}
                onPress={() => {
                  if (x.meta?.folderId) {
                    // @ts-ignore
                    navigate('Folder', {
                      id: x.meta?.folderId,
                    });
                  }
                  if (x.meta?.receiptId) {
                    // @ts-ignore
                    navigate('Receipt', {
                      id: x.meta?.receiptId,
                    });
                  }
                  markAsRead(x.id);
                }}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    emptyContainer: {
      paddingTop: theme.spacing.lg,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptySubtitle: {
      color: theme.colors.text.dark,
      fontSize: 13,
      marginTop: theme.spacing.xxs,
    },
    emptyTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      fontSize: 18,
      marginTop: theme.spacing.xxl,
    },
    content: {
      width: '100%',
      backgroundColor: '#f5f5f5',
      marginTop: theme.spacing.xxs,
      height: Dimensions.get('window').height * 0.6,
      zIndex: 1000,
    },
    scrollview: {
      padding: theme.spacing.md,
    },
    headerCardContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.xl,
    },
    headerCardText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
    },
    container: {
      flex: 1,
      backgroundColor: '#f6f6f6',
    },
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: '#333',
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      padding: '5%',
      paddingBottom: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  }),
);
