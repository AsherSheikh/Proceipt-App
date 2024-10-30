import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { styleSheetFactory, useTheme } from 'theme';
import { DownArrow } from 'assets/svg/down-arrow';
import { GridIcon } from 'assets/svg/grid';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import auth from '@react-native-firebase/auth';
import { toFormattedDate } from 'utils/date';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { RootStackParameterList } from 'navigation/navigator';
import { ClockIcon } from 'assets/svg/clock';
import { LettersIcon } from 'assets/svg/letters';
import { ShareIcon } from 'assets/svg/share';
import { CheckMarkIcon } from 'assets/svg/check-mark';
import { compose, prop, sortBy, toLower, toString } from 'ramda';
import { Receipt, User } from 'utils/type';
import { ShareFolderIcon } from 'assets/svg/folder-share';
import { DeleteIcon } from 'assets/svg/delete';
import { FacebookIcon } from 'assets/svg/facebook';
import { TwitterIcon } from 'assets/svg/twitter';
import { MoreIcon } from 'assets/svg/more';
import { useReadUsersMutation } from 'features/profile/profile-reducer';
import { useDebounce } from 'hooks/use-debounce';
import CloseIcon from 'assets/svg/close';
import Avatar from 'components/avatar/avatar-component';
import {
  useDeleteReceiptMutation,
  useMoveIntoFolderMutation,
  useShareReceiptMutation,
  useUpdateReceiptMutation,
} from 'features/receipt/receipt-reducer';
import { AltReceipt } from 'components/receipt';
import { ReceiptIcon } from 'assets/svg/receipt';
import { FavoriteIcon, FilledFavoriteIcon } from 'assets/svg/favorite';
import {
  useLazyReadFolderQuery,
  useReadFoldersQuery,
} from 'features/folder/folder-reducer';
import { Folder } from 'components/folder';
import NoReceiptIcon from 'assets/svg/no-receipt';
import { LeftArrow } from 'assets/svg/left-arrow';

const postOnFacebook = ({
  facebookShareURL,
  content,
}: {
  facebookShareURL: string;
  content: string;
}) => {
  let facebookParameters: string[] = [];
  if (facebookShareURL) {
    facebookParameters.push('u=' + encodeURI(facebookShareURL));
  }
  if (content) {
    facebookParameters.push('quote=' + encodeURI(content));
  }
  const url =
    'https://www.facebook.com/sharer/sharer.php?' +
    facebookParameters.join('&');

  return Linking.openURL(url);
};

const tweetNow = ({
  url,
  content,
  account,
}: {
  url: string;
  content: string;
  account: string;
}) => {
  let twitterParameters: string[] = [];
  if (url) {
    twitterParameters.push('url=' + encodeURI(url));
  }
  if (content) {
    twitterParameters.push('text=' + encodeURI(content));
  }
  if (account) {
    twitterParameters.push('via=' + encodeURI(account));
  }
  const finalUrl =
    'https://twitter.com/intent/tweet?' + twitterParameters.join('&');

  Linking.openURL(finalUrl);
};

const share = ({ content }: { content: string }) =>
  Share.share({
    message: content,
  });

const SORT_CRITERIA = [
  { name: 'Sort by name', key: 'name', icon: <LettersIcon /> },
  { name: 'Sort by modified', key: 'updatedAt', icon: <ClockIcon /> },
  { name: 'Sort by shared', key: 'shared', icon: <ShareIcon /> },
];

const FOLDER_OPTIONS = [
  { name: 'Share', key: 'share', icon: <ShareFolderIcon /> },
  { name: 'Favorite', key: 'favorite', icon: <FavoriteIcon /> },
  { name: 'Remove from folder', key: 'delete', icon: <DeleteIcon /> },
];

export default function FolderDetailsScreen() {
  const { goBack, navigate } =
    useNavigation<NavigationProp<RootStackParameterList>>();
  const { params } =
    useRoute<RouteProp<RootStackParameterList, 'FolderDetails'>>();

  const [fetchFolder, { data }] = useLazyReadFolderQuery();
  const { data: folders = [] } = useReadFoldersQuery();

  const [shareFolderWithContacts, { isLoading: isSharing }] =
    useShareReceiptMutation();
  const [deleteReceipt] = useDeleteReceiptMutation();
  const [fetchUsers, { data: searchResults, reset }] = useReadUsersMutation();
  const [updateReceipt] = useUpdateReceiptMutation();

  const [modalType, setModalType] = useState<
    'OPTIONS' | 'CREATE' | 'MOVE' | 'SORT' | 'UPDATE' | 'SHARE'
  >('CREATE');

  const [sortCriteria, setSortCriteria] = useState('name');
  const [contactsValue, setContactsValue] = useState('');
  const [message, setMessage] = useState('');
  const [contactsList, setContactsList] = useState<User[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<null | Receipt>(null);

  useDebounce(
    () => {
      if (contactsValue) {
        fetchUsers(contactsValue);
      } else {
        reset();
      }
    },
    1000,
    [contactsValue],
  );

  const [moveIntoFolder] = useMoveIntoFolderMutation();

  const [styles] = useTheme(Styles);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => {
    if (modalType === 'CREATE' || modalType === 'UPDATE') {
      return [500];
    } else if (modalType === 'OPTIONS') {
      return [490];
    } else if (modalType === 'SHARE') {
      return [550];
    } else if (modalType === 'MOVE') {
      return [550];
    } else {
      return [300];
    }
  }, [modalType]);

  const handlePresentModalPress = useCallback(
    (type: 'OPTIONS' | 'CREATE' | 'MOVE' | 'SORT' | 'UPDATE' | 'SHARE') => {
      setModalType(type);
      bottomSheetRef.current?.present();
    },
    [],
  );

  const Receipts = useMemo(() => {
    if (data?.receipts) {
      const getByCriteria = sortBy(
        compose(toLower, toString, prop(sortCriteria)),
      );
      return getByCriteria(data.receipts) as Receipt[];
    }
    return [];
  }, [sortCriteria, data]);

  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };

  const removeFromList = (id: string) => {
    const newList = contactsList.filter(x => x.id !== id);
    setContactsList(newList);
  };

  const shareReceipt = async () => {
    if (contactsList.length && selectedReceipt) {
      await shareFolderWithContacts({
        id: selectedReceipt.id,
        body: {
          contacts: contactsList.map(x => x.id),
        },
      }).unwrap();

      bottomSheetRef.current?.close();
    }
  };

  const getSortTitles = (value: string) => {
    switch (value) {
      case 'name':
        return 'Name';
      case 'updatedAt':
        return 'Last Modified';
      case 'shared':
        return 'Shared';
      case 'receipts':
        return 'Receipts';
      default:
        return '';
    }
  };

  const handleReceiptOptions = async (option: string) => {
    if (option === 'share') {
      handlePresentModalPress('SHARE');
    }
    if (option === 'move') {
      handlePresentModalPress('MOVE');
    }
    if (option === 'favorite') {
      selectedReceipt &&
        updateReceipt({
          id: selectedReceipt.id,
          body: { favorite: selectedReceipt.favorite ? false : true },
        });
      bottomSheetRef?.current?.close();
    }
    if (option === 'delete') {
      selectedReceipt && (await deleteReceipt(selectedReceipt.id).unwrap());
      bottomSheetRef?.current?.close();
      fetchFolder(params.id);
      setSelectedReceipt(null);
    }
  };

  const handleMoveIntoFolder = (id: number) => {
    if (selectedReceipt) {
      moveIntoFolder({ id: selectedReceipt.id, folder: id });
    }
  };

  const user = auth().currentUser?.uid;

  useEffect(() => {
    if (params.id) {
      fetchFolder(params.id);
    }
  }, [params.id, fetchFolder]);

  // @ts-ignore
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={styles.leftHeader}>
            <LeftArrow color="#000" />
          </Pressable>
          <Pressable />
        </View>

        <View>
          <Text style={styles.headerText}>{params.name}</Text>
          <Text style={styles.headerSubText}>
            {params.numberOfReceipts} Files
          </Text>
        </View>

        <View style={styles.subHeader}>
          <Pressable
            onPress={() => handlePresentModalPress('SORT')}
            style={styles.filterContainer}
          >
            <Text style={styles.filterText}>{getSortTitles(sortCriteria)}</Text>
            <DownArrow color="#000" />
          </Pressable>
          <Pressable>
            <GridIcon color="#000" />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {!Receipts?.length && (
          <View style={styles.emptyContainer}>
            <NoReceiptIcon />
            <Text style={styles.emptyTitle}>No Receipts</Text>
            <Text style={styles.emptySubtitle}>
              Please scan or upload new receipts
            </Text>
          </View>
        )}
        <ScrollView style={styles.scrollview}>
          {Receipts?.map(x => (
            <AltReceipt
              key={x.id}
              title={x.name}
              subtitle={`${toFormattedDate(x.createdAt)}`}
              onPress={() => navigate('ReceiptDetails', { receipt: x })}
              total={x.total ?? ''}
              onPressDots={() => {
                setSelectedReceipt(x);
                handlePresentModalPress('OPTIONS');
              }}
            />
          ))}
        </ScrollView>
      </View>

      <BottomSheetModal
        backdropComponent={renderBackdrop}
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        style={styles.background}
      >
        {modalType === 'OPTIONS' && selectedReceipt && (
          <BottomSheetScrollView contentContainerStyle={styles.innerView}>
            <View style={styles.largeContainer}>
              <View style={styles.left}>
                <ReceiptIcon />
                <View style={styles.folderContent}>
                  <Text style={styles.title}>{selectedReceipt.name}</Text>
                  <Text style={styles.subtitle}>
                    {toFormattedDate(selectedReceipt.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            {FOLDER_OPTIONS.map(x => {
              const { name: title, icon, key } = x;

              return (
                <Pressable
                  onPress={() => {
                    handleReceiptOptions(key);
                  }}
                  style={styles.optionsContainer}
                  key={key}
                >
                  <View style={styles.sortTextContainer}>
                    {key === 'favorite' && selectedReceipt.favorite ? (
                      <FilledFavoriteIcon />
                    ) : (
                      icon
                    )}
                    <Text style={styles.optionsTitle}>{title}</Text>
                  </View>
                </Pressable>
              );
            })}
          </BottomSheetScrollView>
        )}

        {modalType === 'SORT' && (
          <BottomSheetScrollView>
            {SORT_CRITERIA.map(x => {
              const { name: title, icon, key } = x;

              return (
                <Pressable
                  onPress={() => {
                    setSortCriteria(key);
                    bottomSheetRef.current?.close();
                  }}
                  style={styles.sortContainer}
                  key={key}
                >
                  <View style={styles.sortTextContainer}>
                    {icon}
                    <Text style={styles.sortText}>{title}</Text>
                  </View>
                  {sortCriteria === key && <CheckMarkIcon />}
                </Pressable>
              );
            })}
          </BottomSheetScrollView>
        )}

        {modalType === 'MOVE' && selectedReceipt && (
          <>
            <View style={styles.move}>
              <View style={styles.largeContainer}>
                <View style={styles.left}>
                  <ReceiptIcon />
                  <View style={styles.folderContent}>
                    <Text style={styles.title}>{selectedReceipt.name}</Text>
                    <Text style={styles.subtitle}>
                      {toFormattedDate(selectedReceipt.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.moveTitle}>Move Receipt To</Text>
            </View>

            <BottomSheetScrollView contentContainerStyle={styles.innerMoveView}>
              {folders?.map(x => (
                <Folder
                  icon={x.icon || 'mountain'}
                  key={x.id}
                  color={x.color}
                  title={x.name}
                  subtitle={`${toFormattedDate(x.createdAt)} . ${
                    x.numberOfReceipts ?? 0
                  } files`}
                  onPress={() => handleMoveIntoFolder(x.id)}
                />
              ))}
            </BottomSheetScrollView>
          </>
        )}

        {modalType === 'SHARE' && selectedReceipt && (
          <BottomSheetScrollView contentContainerStyle={styles.innerView}>
            <View style={styles.largeContainer}>
              <View style={styles.left}>
                <ReceiptIcon />
                <View style={styles.folderContent}>
                  <Text style={styles.title}>{selectedReceipt.name}</Text>
                  <Text style={styles.subtitle}>
                    {toFormattedDate(selectedReceipt.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.label}>Send to</Text>
            <View style={styles.inputContainer}>
              <View style={styles.tagContainer}>
                {contactsList.map(contact => (
                  <View style={styles.tag} key={contact.id}>
                    <Text style={styles.tagText}>{contact.name}</Text>
                    <Pressable onPress={() => removeFromList(contact.id)}>
                      <CloseIcon color="#000" />
                    </Pressable>
                  </View>
                ))}
              </View>
              <BottomSheetTextInput
                placeholderTextColor="#999"
                style={styles.input}
                placeholder="Enter contacts"
                value={contactsValue}
                onChangeText={x => setContactsValue(x)}
              />
            </View>

            <View style={styles.searchResultContainer}>
              {searchResults
                ?.filter(x => x.id !== user)
                ?.filter(x => contactsList.every(a => a.id !== x.id))
                .map(x => (
                  <Pressable
                    key={x.id}
                    onPress={() => {
                      const newList = [...contactsList, x] as User[];
                      setContactsList(newList);
                      setContactsValue('');
                      reset();
                    }}
                    style={styles.searchResult}
                  >
                    <Avatar size="small" name={x.name ?? ''} />
                    <View>
                      <Text style={styles.searchResultText}>{x.name}</Text>
                      <Text style={styles.searchResultSubtext}>
                        {x.username}
                      </Text>
                    </View>
                  </Pressable>
                ))}
            </View>

            {(contactsValue || contactsList.length > 0) && (
              <>
                <Text style={styles.label}>Message</Text>
                <View style={styles.inputContainer}>
                  <BottomSheetTextInput
                    placeholderTextColor="#999"
                    style={styles.input}
                    placeholder="Enter message"
                    value={message}
                    onChangeText={x => setMessage(x)}
                  />
                </View>
              </>
            )}

            {!contactsValue && contactsList.length <= 0 && (
              <>
                <Text style={styles.label}>Or share with</Text>

                <ScrollView horizontal>
                  <Pressable
                    onPress={async () =>
                      tweetNow({
                        content: 'Download proceipt to save your receipts',
                        url: 'https://proceipt.com',
                        account: 'proceipt',
                      })
                    }
                    style={styles.folderIconContainer}
                  >
                    <TwitterIcon />
                    <Text style={styles.folderIconText}>Twitter</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      postOnFacebook({
                        content: 'Download proceipt to save your receipts',
                        facebookShareURL: 'https://proceipt.com',
                      });
                    }}
                    style={styles.folderIconContainer}
                  >
                    <FacebookIcon />
                    <Text style={styles.folderIconText}>Facbook</Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      share({
                        content: 'Download proceipt to saved your receipts',
                      })
                    }
                    style={styles.folderIconContainer}
                  >
                    <MoreIcon />
                    <Text style={styles.folderIconText}>More</Text>
                  </Pressable>
                </ScrollView>
              </>
            )}

            {(contactsValue || contactsList.length > 0) && (
              <>
                <Pressable onPress={shareReceipt} style={styles.button}>
                  {isSharing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Share</Text>
                  )}
                </Pressable>
              </>
            )}
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
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
    container: {
      flex: 1,
      backgroundColor: '#F8F9FD',
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
    title: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      marginBottom: theme.spacing.xxs,
      fontSize: 16,
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
