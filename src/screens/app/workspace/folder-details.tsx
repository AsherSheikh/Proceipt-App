import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styleSheetFactory, useTheme } from '../../../theme';
import React, { useEffect, useState } from 'react';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParameterList } from '../../../navigation/navigator';
import CameraButton from '../../../navigation/camera-button';
import { AltReceipt } from '../../../components/receipt';
import { toFormattedDate } from '../../../utils/date';

import NoReceiptIcon from '../../../assets/svg/no-receipt';
import { OrganisationFolder, ReceiptWithUploadedAt } from '../../../utils/type';
import { AppBar } from '../../../components/app_bar';
import firestore from '@react-native-firebase/firestore';

export const AssignedFolderDetailsScreen = () => {
  const [styles] = useTheme(Styles);
  const [opened, setOpened] = React.useState(false);
  const [receipts, setReceipts] = useState<ReceiptWithUploadedAt[]>([]);
  const [loading, setLoading] = useState(false);

  const { params } =
    useRoute<RouteProp<RootStackParameterList, 'AssignedFolderDetails'>>();

  const toggleOpened = () => setOpened(!opened);
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();

  useEffect(() => {
    setReceipts(params.receipts);
    setLoading(true);
    firestore()
      .collection('folders-test')
      .where('id', '==', params.id)
      .limit(1)
      .onSnapshot(snapshot => {
        const folder = snapshot.docs[0].data() as OrganisationFolder;
        setReceipts(folder.receipts);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }
  const renderItem = ({ item }: { item: ReceiptWithUploadedAt }) => {
    let dateValue = item.createdAt;
    try {
      // @ts-ignore
      dateValue = item.uploadedAt.toDate();
    } catch (e) {}

    return (
      <TouchableOpacity
        onPress={() =>
          navigate('ReceiptDetails', { receipt: item, folderId: params.id })
        }
      >
        <AltReceipt
          key={item.id}
          title={item.name}
          subtitle={toFormattedDate(dateValue ?? item.invoice_receipt_date)}
          onPress={() =>
            navigate('ReceiptDetails', { receipt: item, folderId: params.id })
          }
          total={`${Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: item?.currency ?? 'GBP',
          }).format(parseFloat(item.total || '0'))}`}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppBar title={`${params.name} Receipts`} />
      {receipts?.length === 0 ? (
        <View style={[styles.emptyContainer, { marginTop: 120 }]}>
          <NoReceiptIcon />
          <Text style={styles.emptyTitle}>No Receipts</Text>
          <Text style={styles.emptySubtitle}>
            Please scan or upload new receipts
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={receipts}
            renderItem={renderItem}
            style={{
              flex: 1,
              width: '100%',
              paddingHorizontal: 10,
              paddingVertical: 20,
              marginTop: 100,
            }}
          />
        </>
      )}

      <View style={styles.addButton}>
        <CameraButton
          opened={opened}
          toggleOpened={toggleOpened}
          folderId={params.id}
        />
      </View>
    </View>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
    },
    appBar: {
      backgroundColor: '#fff',
      height: 65,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      marginBottom: 15,
      flexDirection: 'row',
      paddingHorizontal: 10,
    },
    appBarText: {
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'capitalize',
      flex: 1,
      textAlign: 'center',
    },
    card: {
      backgroundColor: 'white',
      width: 170,
      height: 100,
      marginRight: 10,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    title: {
      fontSize: 24,
    },

    addButton: {
      position: 'absolute',
      bottom: 60,
      right: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      width: '100%',
      backgroundColor: '#F8F9FD',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      height: '100%',
    },
    scrollview: {
      paddingTop: 0,
      padding: theme.spacing.md,
    },
    subHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      justifyContent: 'space-between',
    },
    headerCardContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xl,
    },
    headerCard: {
      padding: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 10,
      backgroundColor: theme.colors.text.primary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerCardText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
    },
    filterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    filterText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },

    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.semibold,
      fontSize: 27,
      marginLeft: theme.spacing.xs,
      width: '100%',
      textAlign: 'center',
      marginTop: theme.spacing.lg,
    },
    headerSubText: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.regular,
      fontSize: 13,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    shareButton: {
      width: 140,
      height: 50,
      borderWidth: 1,
      borderColor: '#5BAD09',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
      marginTop: theme.spacing.lg,
    },
    shareButtonText: {
      color: '#5BAD09',
      fontFamily: theme.font.medium,
      fontSize: 16,
    },
    wrapper: {
      backgroundColor: '#F8F9FD',
      padding: '5%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    sortText: {
      fontFamily: theme.font.regular,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
    },
    sortTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
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
    buttonText: {
      fontFamily: theme.font.medium,
      color: theme.colors.button.color,
    },
    inputContainer: {
      width: '100%',
      borderBottomWidth: 0.5,
      borderBottomColor: '#E2EDFF',
      paddingBottom: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    input: {
      fontFamily: theme.font.regular,
      color: '#000',
    },
    label: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
    },
    colorContainer: {
      width: 47,
      height: 47,
      borderRadius: 47,
      marginRight: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    color: {
      width: 35,
      borderRadius: 35,
      height: 35,
    },
    innerView: {
      padding: '5%',
    },
    innerMoveView: {
      padding: '5%',
      paddingTop: 0,
    },
    background: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
    },
    errorText: {
      color: theme.colors.error.primary,
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
    },

    folderContent: {
      marginLeft: theme.spacing.md,
    },
    largeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '100%',
      backgroundColor: theme.colors.card.background,
      borderRadius: 15,
      marginBottom: theme.spacing.md,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    moveTitle: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      fontSize: 14,
    },
    total: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      fontSize: 16,
    },
    subtitle: {
      color: theme.colors.text.light,
      fontFamily: theme.font.regular,
    },
    optionsContainer: {
      backgroundColor: '#F8F9FD',
      borderRadius: 15,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    optionsTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      marginLeft: theme.spacing.md,
    },
    folderIconContainer: {
      alignItems: 'center',
      marginRight: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    folderIconText: {
      color: '#7B7D7E',
      fontFamily: theme.font.regular,
      fontSize: 13,
      marginTop: theme.spacing.sm,
    },
    searchResultText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 14,
    },
    searchResultSubtext: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xs,
    },
    searchResult: {
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
    },
    searchResultContainer: {
      marginBottom: theme.spacing.sm,
      flexDirection: 'column',
    },
    tag: {
      backgroundColor: '#f2f2f2',
      padding: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tagText: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.regular,
      fontSize: 13,
      marginRight: theme.spacing.xs,
    },
    tagContainer: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    move: {
      marginLeft: theme.spacing.xl,
      marginTop: theme.spacing.sm,
    },
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
  }),
);
