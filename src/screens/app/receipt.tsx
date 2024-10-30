import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { styleSheetFactory, theme, useTheme } from 'theme';
import { DownArrow } from 'assets/svg/down-arrow';
import { GridIcon } from 'assets/svg/grid';
import Toast from 'react-native-toast-message';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import auth from '@react-native-firebase/auth';
import { toDate, toFormattedDate } from 'utils/date';
import {
  NavigationProp,
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  AppStackParameterList,
  RootStackParameterList,
} from 'navigation/navigator';
import { ClockIcon } from 'assets/svg/clock';
import { LettersIcon } from 'assets/svg/letters';
import { ShareIcon } from 'assets/svg/share';
import { CheckMarkIcon } from 'assets/svg/check-mark';
import { compose, prop, sortBy, toLower, toString } from 'ramda';
import { Receipt, User } from 'utils/type';
import { ShareFolderIcon } from 'assets/svg/folder-share';
import { DeleteIcon } from 'assets/svg/delete';
import {
  getUser,
  useReadUsersMutation,
} from 'features/profile/profile-reducer';
import { useDebounce } from 'hooks/use-debounce';
import CloseIcon from 'assets/svg/close';
import Avatar from 'components/avatar/avatar-component';
import {
  useDeleteReceiptMutation,
  useMoveIntoFolderMutation,
  useReadReceiptsQuery,
  useShareReceiptMutation,
  useUpdateReceiptMutation,
} from 'features/receipt/receipt-reducer';
import {
  AltReceipt as ReceiptComponent,
  GridReceipt,
} from 'components/receipt';
import { ReceiptIcon } from 'assets/svg/receipt';
import { FavoriteIcon, FilledFavoriteIcon } from 'assets/svg/favorite';
import { MoveIcon } from 'assets/svg/move';
import { useReadFoldersQuery } from 'features/folder/folder-reducer';
import { Folder } from 'components/folder';
import NoReceiptIcon from 'assets/svg/no-receipt';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CurvedArrowIcon } from 'assets/svg/folder/curved-arrow';
import { useSelector } from 'react-redux';
import { getParamByParam } from 'iso-country-currency';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { convertToCSV } from '../../utils/convert_to_csv';
import ReactNativeBlobUtil from 'react-native-blob-util';

require('its-a-date');

const SORT_CRITERIA = [
  { name: 'Sort by name', key: 'name', icon: <LettersIcon /> },
  { name: 'Sort by modified', key: 'updatedAt', icon: <ClockIcon /> },
  { name: 'Sort by shared', key: 'shared', icon: <ShareIcon /> },
];

const FOLDER_OPTIONS = [
  { name: 'Share', key: 'share', icon: <ShareFolderIcon /> },
  { name: 'Favorite', key: 'favorite', icon: <FavoriteIcon /> },
  { name: 'Move Into Folder', key: 'move', icon: <MoveIcon /> },
  { name: 'Delete', key: 'delete', icon: <DeleteIcon /> },
];

export default function ReceiptScreen() {
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();
  const { params } = useRoute<RouteProp<AppStackParameterList, 'Receipt'>>();

  const { data: receipts, refetch } = useReadReceiptsQuery();

  const { data: folders } = useReadFoldersQuery();
  const [isGrid, setIsGrid] = useState(false);

  const [shareFolderWithContacts, { isLoading: isSharing }] =
    useShareReceiptMutation();
  const [deleteReceipt] = useDeleteReceiptMutation();
  const [fetchUsers, { data: searchResults, reset }] = useReadUsersMutation();
  const [updateReceipt] = useUpdateReceiptMutation();

  const insets = useSafeAreaInsets();

  const [modalType, setModalType] = useState<
    'OPTIONS' | 'CREATE' | 'MOVE' | 'SORT' | 'UPDATE' | 'SHARE' | 'EXPORT'
  >('CREATE');

  const [sortCriteria, setSortCriteria] = useState('updatedAt');
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

  const isFocused = useIsFocused();

  const userData = useSelector(getUser);

  const reference = useRef<FlatList>(null);

  const [exportingReceipts, setExportingReceipts] = useState(false);

  useEffect(() => {
    refetch();
  }, [isFocused, refetch]);

  const [styles] = useTheme(Styles);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    setTimeout(() => {
      if (receipts?.length && params?.id) {
        const index = receipts?.findIndex(x => x.id === params?.id);
        index !== -1 &&
          reference.current?.scrollToIndex({
            animated: true,
            index: index as number,
          });
      }
    }, 1000);
  }, [receipts, params]);

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
      return [230];
    }
  }, [modalType]);

  const handlePresentModalPress = useCallback(
    (
      type:
        | 'OPTIONS'
        | 'CREATE'
        | 'MOVE'
        | 'SORT'
        | 'UPDATE'
        | 'SHARE'
        | 'EXPORT',
    ) => {
      setModalType(type);
      bottomSheetRef.current?.present();
    },
    [],
  );

  const Receipts = useMemo(() => {
    if (receipts) {
      const _receipts = receipts?.map(x => {
        return {
          ...x,
          updatedAt:
            toDate(x?.invoice_receipt_date ?? x.updatedAt) ?? x.updatedAt,
        };
      });

      if (sortCriteria === 'updatedAt') {
        const sorted = [..._receipts]?.sort(
          (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
        );
        return sorted;
      } else {
        const getByCriteria = sortBy(
          compose(toLower, toString, prop(sortCriteria)),
        );
        return getByCriteria(_receipts) as Receipt[];
      }
    }
    return [];
  }, [sortCriteria, receipts]);

  const renderBackdrop: React.FC<BottomSheetBackdropProps> = props => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    );
  };

  const toggleGrid = () => setIsGrid(!isGrid);

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
      setContactsList([]);

      Toast.show({
        type: 'success',
        text1: 'Receipt shared',
      });
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

  const handleReceiptOptions = (option: string) => {
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
      selectedReceipt && deleteReceipt(selectedReceipt.id);
      bottomSheetRef?.current?.close();
      setSelectedReceipt(null);

      Toast.show({
        type: 'success',
        text1: 'Receipt deleted',
      });
    }
  };

  const handleMoveIntoFolder = (id: number) => {
    if (selectedReceipt) {
      moveIntoFolder({ id: selectedReceipt.id, folder: id });
      bottomSheetRef?.current?.close();

      Toast.show({
        type: 'success',
        text1: 'Receipt added to folder',
      });
    }
  };

  const user = auth().currentUser?.uid;

  async function handleExportToCSV() {
    if (!receipts) return;
    const data = receipts?.map(x => {
      return {
        name: x?.name || '',
        amount: x?.total || '',
        image: x?.photoUrl || '',
        date: x?.invoice_receipt_date || '',
        uploadedAt: toFormattedDate(x.createdAt) || '',
      };
    });
    try {
      const fileName = `Proceipt-${Math.floor(Math.random() * 9000) + 1000}`;
      const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}.csv`;
      const csv = convertToCSV(data);
      await RNFS.writeFile(filePath, csv, 'utf8');
      await Share.open({
        url: `file://${filePath}`,
        filename: fileName,
        type: 'text/csv',
        saveToFiles: true,
        failOnCancel: false,
        showAppsToView: true,
      });
    } catch (error) {
      if (error.message === 'CANCELLED') return;
      Toast.show({
        type: 'error',
        text1: 'Error exporting Receipts',
        text2: error,
      });
      console.log(error);
    }
  }

  async function handleExportToZip() {
    if (!receipts) return;
    let images = receipts.map(x => {
      return {
        name: x?.name || '',
        image: x?.photoUrl || '',
      };
    });
    images = images.filter(x => !!x.image) as {
      name: string;
      image: string;
    }[];
    try {
      setExportingReceipts(true);
      Toast.show({
        type: 'success',
        text1: 'Exporting Receipts',
        text2: 'Please wait, this may take a while',
      });
      const imagesPath = await Promise.all(
        images.map(async x => {
          const fileName = `${x.name}-${
            Math.floor(Math.random() * 9000) + 1000
          }`;
          const response = await ReactNativeBlobUtil.config({
            appendExt: 'jpg',
            fileCache: true,
            session: 'proceipt',
            path: `${RNFS.TemporaryDirectoryPath}/${fileName}.jpg`,
            addAndroidDownloads: {
              useDownloadManager: true,
              mime: 'image/jpg',
              description: 'Exporting Receipts',
            },
          }).fetch('GET', x.image);
          return response.path();
        }),
      );

      await Share.open({
        urls: imagesPath.map(x => `file://${x}`),
        filenames: images.map(x => x.name),
        type: 'image/jpg',
        saveToFiles: true,
        failOnCancel: false,
        showAppsToView: true,
      });

      ReactNativeBlobUtil.session('proceipt')
        .dispose()
        .then(() => {
          console.log('session disposed');
        })
        .catch((e: any) => console.log(e));
    } catch (error) {
      ReactNativeBlobUtil.session('proceipt')
        .dispose()
        .then(() => {
          console.log('session disposed in catch');
        })
        .catch((e: any) => console.log(e));
      if (error.message === 'CANCELLED') return;
      Toast.show({
        type: 'error',
        text1: 'Error exporting Receipts',
        text2: error,
      });
      console.log(error);
    } finally {
      setExportingReceipts(false);
    }
  }

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Text style={styles.headerText}>Receipt</Text>
          </View>
          <TouchableOpacity
            style={styles.exportBtn}
            disabled={exportingReceipts}
            onPress={() => {
              if (!receipts || !receipts.length) {
                return Toast.show({
                  type: 'error',
                  text1: 'Scan at least one receipt',
                  text2: 'No receipts found',
                });
              }
              handlePresentModalPress('EXPORT');
            }}
          >
            {exportingReceipts ? (
              <ActivityIndicator />
            ) : (
              <Text
                style={[
                  styles.headerText,
                  { color: 'white', fontFamily: theme.font.medium },
                ]}
              >
                Export
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.subHeader}>
          <Pressable
            onPress={() => handlePresentModalPress('SORT')}
            style={styles.filterContainer}
          >
            <Text style={styles.filterText}>{getSortTitles(sortCriteria)}</Text>
            <DownArrow color="#333" />
          </Pressable>
          <Pressable onPress={toggleGrid}>
            <GridIcon color="#333" />
          </Pressable>
        </View>
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        }}
      >
        <Text style={{ fontFamily: theme.font.medium, color: '#989898' }}>
          Total:{' '}
          <Text style={{ color: theme.colors.text.darkGrey }}>
            {getParamByParam('currency', userData?.currency ?? 'GBP', 'symbol')}
            {` ${userData?.total?.toFixed(2)}`}
          </Text>
        </Text>
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

        {!Receipts?.length && (
          <View
            style={{
              bottom: 115,
              right: 10,
              position: 'absolute',
            }}
          >
            <CurvedArrowIcon />
          </View>
        )}

        <FlatList
          style={styles.scrollview}
          ref={reference}
          data={[...Receipts]}
          numColumns={isGrid ? 2 : 1}
          key={isGrid ? 'h' : 'v'}
          horizontal={false}
          ListFooterComponent={<View style={{ height: 50 }} />}
          {...(isGrid && {
            columnWrapperStyle: { justifyContent: 'space-between' },
          })}
          renderItem={({ item: x, index }) =>
            isGrid ? (
              <GridReceipt
                highlight={receipts?.[index].id === params?.id}
                favorite={x.favorite ?? false}
                key={x.id}
                title={x.name}
                subtitle={`${toFormattedDate(
                  x?.invoice_receipt_date || x.createdAt || new Date(),
                  x.createdAt,
                )}`}
                onPress={() => navigate('ReceiptDetails', { receipt: x })}
                total={`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(x.total || 0)}`}
                onPressDots={() => {
                  setSelectedReceipt(x);
                  handlePresentModalPress('OPTIONS');
                }}
              />
            ) : (
              <ReceiptComponent
                highlight={receipts?.[index].id === params?.id}
                favorite={x.favorite ?? false}
                key={x.id}
                title={x.name}
                subtitle={`${toFormattedDate(x.updatedAt)}`}
                onPress={() => navigate('ReceiptDetails', { receipt: x })}
                total={`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(x.total || 0)}`}
                onPressDots={() => {
                  setSelectedReceipt(x);
                  handlePresentModalPress('OPTIONS');
                }}
              />
            )
          }
        />
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
                    {toFormattedDate(selectedReceipt.updatedAt)}
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

        {modalType === 'EXPORT' && (
          <BottomSheetScrollView contentContainerStyle={styles.innerView}>
            <TouchableOpacity
              style={[
                styles.optionsContainer,
                {
                  marginTop: 0,
                },
              ]}
              onPress={() => {
                bottomSheetRef.current?.close();
                handleExportToCSV();
              }}
            >
              <Text style={styles.optionsTitle}>Export as CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionsContainer, { marginTop: 10 }]}
              onPress={() => {
                bottomSheetRef.current?.close();
                handleExportToZip();
              }}
            >
              <Text style={styles.optionsTitle}>Export as ZIP</Text>
            </TouchableOpacity>
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
                  icon={x?.icon ?? 'basketball'}
                  key={x.id}
                  color={x.color}
                  title={x.name}
                  subtitle={`${toFormattedDate(x.updatedAt)} . ${
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

            <>
              <Pressable onPress={shareReceipt} style={styles.button}>
                {isSharing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Share</Text>
                )}
              </Pressable>
            </>
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>
    </View>
  );
}

// eslint-disable-next-line @typescript-eslint/no-shadow
const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    exportBtn: {
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.text.main,
      padding: 8,
      paddingHorizontal: 14,
    },

    sortText: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.sm,
      fontSize: 14,
    },
    sortTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
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
    content: {
      width: '100%',
      backgroundColor: '#f2f2f2',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      marginTop: theme.spacing.xxs,
      height: Dimensions.get('window').height * 0.665,
    },
    scrollview: {
      paddingHorizontal: theme.spacing.md,
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
      backgroundColor: theme.colors.text.white,
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
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
      textTransform: 'capitalize',
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
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      backgroundColor: '#fff',
      padding: '5%',
    },
    header: {
      paddingTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
