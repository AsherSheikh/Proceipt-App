import { ActivityIndicator, Dimensions, FlatList, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styleSheetFactory, theme, useTheme } from 'theme';
import { SearchIcon } from 'assets/svg/search';
import { DownArrow } from 'assets/svg/down-arrow';
import { GridIcon } from 'assets/svg/grid';
import { Folder as FolderComponent, GridFolder } from 'components/folder';
import {
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useReadFoldersQuery,
  useShareFolderMutation,
  useUpdateFolderMutation,
} from 'features/folder/folder-reducer';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { hexToRGB } from 'utils/hex-to-rgba';
import { toFormattedDate } from 'utils/date';
import { NavigationProp, RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { AppStackParameterList, RootStackParameterList } from 'navigation/navigator';
import { ClockIcon } from 'assets/svg/clock';
import { LettersIcon } from 'assets/svg/letters';
import { ReceiptIllustration } from 'assets/svg/receipt-illustration';
import { ShareIcon } from 'assets/svg/share';
import { CheckMarkIcon } from 'assets/svg/check-mark';
import { compose, prop, sortBy, toLower, toString } from 'ramda';
import { Folder, User } from 'utils/type';
import { LargeFolder2Icon } from 'assets/svg/folder';
import { ShareFolderIcon } from 'assets/svg/folder-share';
import { FolderSettingsIcon } from 'assets/svg/folder-settings';
import { DuplicateIcon } from 'assets/svg/duplicate';
import { RenameIcon } from 'assets/svg/rename';
import { DeleteIcon } from 'assets/svg/delete';
import { getUser, useReadUsersMutation } from 'features/profile/profile-reducer';
import { useDebounce } from 'hooks/use-debounce';
import CloseIcon from 'assets/svg/close';
import Avatar from 'components/avatar/avatar-component';
import NoReceiptIcon from 'assets/svg/no-receipt';
import { selectableIconsMap } from 'components/icons';
import { chunk } from 'lodash';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { getParamByParam } from 'iso-country-currency';
import { removeCurrencySymbol } from '../../utils/currency-format';

const COLORS = [
  '#0032FA',
  '#FFA000',
  '#FA4D19',
  '#5BAD09',
  '#FF0000',
  '#4A4A4A',
];

const SORT_CRITERIA = [
  { name: 'Sort by name', key: 'name', icon: <LettersIcon /> },
  { name: 'Sort by modified', key: 'updatedAt', icon: <ClockIcon /> },
  { name: 'Sort by shared', key: 'shared', icon: <ShareIcon /> },
  {
    name: 'Sort by number of receipt',
    key: 'receipts',
    icon: <ReceiptIllustration />,
  },
];

const FOLDER_OPTIONS = [
  { name: 'Share', key: 'share', icon: <ShareFolderIcon /> },
  { name: 'Folder Settings', key: 'settings', icon: <FolderSettingsIcon /> },
  {
    name: 'Duplicate',
    key: 'duplicate',
    icon: <DuplicateIcon />,
  },
  { name: 'Rename', key: 'rename', icon: <RenameIcon /> },
  { name: 'Delete', key: 'delete', icon: <DeleteIcon /> },
];

export default function FolderScreen() {
  const { navigate } = useNavigation<NavigationProp<RootStackParameterList>>();
  const { params } = useRoute<RouteProp<AppStackParameterList, 'Folder'>>();

  const { data: folders, refetch } = useReadFoldersQuery();
  const [createNewFolder, { isLoading }] = useCreateFolderMutation();
  const [shareFolderWithContacts, { isLoading: isSharing }] =
    useShareFolderMutation();
  const [updateExistingFolder] = useUpdateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [fetchUsers, { data: searchResults, reset }] = useReadUsersMutation();

  const [modalType, setModalType] = useState<
    'OPTIONS' | 'CREATE' | 'SORT' | 'UPDATE' | 'SHARE'
  >('CREATE');

  const [sortCriteria, setSortCriteria] = useState('updatedAt');
  const [contactsValue, setContactsValue] = useState('');
  const [icon, setIcon] = useState('mountain');
  const [message, setMessage] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const [contactsList, setContactsList] = useState<User[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<null | Folder>(null);

  const reference = useRef<FlatList>(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (params && 'action' in params && params?.action === 'createFolder') {
      setTimeout(() => {
        handlePresentModalPress('CREATE');
      }, 5);
    }
  }, [params]);

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

  const isFocused = useIsFocused();

  useEffect(() => {
    refetch();
  }, [isFocused, refetch]);

  const [styles] = useTheme(Styles);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => {
    if (modalType === 'CREATE' || modalType === 'UPDATE') {
      return [560];
    } else if (modalType === 'OPTIONS') {
      return [490];
    } else if (modalType === 'SHARE') {
      return [550];
    } else {
      return [270];
    }
  }, [modalType]);

  const toggleGrid = () => setIsGrid(!isGrid);

  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const userData = useSelector(getUser);

  const handlePresentModalPress = useCallback(
    (type: 'OPTIONS' | 'CREATE' | 'SORT' | 'UPDATE' | 'SHARE') => {
      setModalType(type);
      bottomSheetRef.current?.present();
    },
    [],
  );

  const Folders = useMemo(() => {
    if (folders) {
      if (sortCriteria === 'updatedAt') {
        const sorted = [...folders].sort(
          (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
        );
        return sorted;
      } else {
        const getByCriteria = sortBy(
          compose(toLower, toString, prop(sortCriteria)),
        );
        return getByCriteria(folders) as Folder[];
      }
    }
    return [];
  }, [sortCriteria, folders]);

  useEffect(() => {
    setTimeout(() => {
      if (folders?.length && params?.id) {
        const index = Folders?.findIndex(x => x.id === params?.id);
        index !== -1 &&
          reference.current?.scrollToIndex({
            animated: true,
            index: index as number,
          });
      }
    }, 1000);
  }, [Folders, params]);

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

  const createFolder = async () => {
    setError('');
    if (!name) {
      setError('Folder name is required');
    } else {
      await createNewFolder({
        name,
        description,
        color: selectedColor,
        icon,
      }).unwrap();

      setSelectedColor(COLORS[0]);
      setName('');
      setDescription('');

      bottomSheetRef.current?.close();
    }
  };

  const updateFolder = async () => {
    setError('');
    if (!name) {
      setError('Folder name is required');
    } else {
      await updateExistingFolder({
        id: selectedFolder?.id as number,
        body: {
          name,
          description,
          color: selectedColor,
          icon,
        },
      }).unwrap();

      setSelectedColor(COLORS[0]);
      setName('');
      setDescription('');

      bottomSheetRef.current?.close();
    }
  };

  const duplicateFolder = async () => {
    await createNewFolder({
      name: selectedFolder?.name + ' copy',
      color: selectedFolder?.color ?? '#000',
      icon: selectedFolder?.icon ?? 'basketball',
    }).unwrap();
    bottomSheetRef?.current?.close();
  };

  const shareFolder = async () => {
    if (contactsList.length && selectedFolder) {
      await shareFolderWithContacts({
        id: selectedFolder.id,
        body: {
          contacts: contactsList.map(x => x.id),
        },
      }).unwrap();

      bottomSheetRef.current?.close();
      setContactsList([]);
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

  const handleFolderOptions = (option: string) => {
    if (option === 'share') {
      handlePresentModalPress('SHARE');
    }
    if (option === 'duplicate') {
      duplicateFolder();
    }
    if (['rename', 'settings'].includes(option)) {
      setName(selectedFolder?.name ?? '');
      setSelectedColor(selectedFolder?.color ?? COLORS[0]);
      setDescription(selectedFolder?.description ?? '');
      handlePresentModalPress('UPDATE');
    }
    if (option === 'delete') {
      selectedFolder && deleteFolder(selectedFolder.id);
      bottomSheetRef?.current?.close();
    }
  };

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <Text style={styles.headerText}>Folder</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#000F48',
                borderRadius: 5,paddingHorizontal: 10,
                paddingVertical: 8,
                alignItems:"center",
                justifyContent:"center" }}
              onPress={() => handlePresentModalPress('CREATE')}
            >
              <Text
                style={[
                  styles.headerText,
                  { color: 'white', fontFamily: theme.font.medium },
                ]}
              >
                Add Folder
              </Text>
            </TouchableOpacity>
          </View>
          <Pressable>
            <SearchIcon />
          </Pressable>
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
        {!Folders?.length && (
          <View style={styles.emptyContainer}>
            <NoReceiptIcon />
            <Text style={styles.emptyTitle}>No Folders</Text>
            <Text style={styles.emptySubtitle}>Please create a folder</Text>
          </View>
        )}

        <FlatList
          style={styles.scrollview}
          data={Folders}
          numColumns={isGrid ? 2 : 1}
          key={isGrid ? 'h' : 'v'}
          horizontal={false}
          ListFooterComponent={<View style={{ height: 50 }} />}
          {...(isGrid && {
            columnWrapperStyle: { justifyContent: 'space-between' },
          })}
          renderItem={({ item, index }) =>
            isGrid ? (
              <GridFolder
                key={item.id}
                highlight={Folders?.[index].id === params?.id}
                color={item.color}
                title={item.name}
                subtitle={`${toFormattedDate(item.createdAt)} `}
                onPress={() => navigate('FolderDetails', item)}
                icon={item.icon as string}
                amount={`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(
                  parseFloat(
                    removeCurrencySymbol(item?.total.toString()) || '0',
                  ),
                )}`}
                onPressDots={() => {
                  setSelectedFolder(item);
                  setIcon(item?.icon ?? 'mountain');
                  handlePresentModalPress('OPTIONS');
                }}
              />
            ) : (
              <FolderComponent
                highlight={Folders?.[index].id === params?.id}
                key={item.id}
                color={item.color}
                icon={item.icon as string}
                title={item.name}
                amount={`${Intl.NumberFormat('en-GB', {
                  style: 'currency',
                  currency: userData?.currency ?? 'GBP',
                }).format(
                  parseFloat(
                    removeCurrencySymbol(item?.total.toString()) || '0',
                  ),
                )}`}
                subtitle={`${toFormattedDate(item.createdAt)} . ${
                  item.numberOfReceipts ?? 0
                } files`}
                onPress={() => navigate('FolderDetails', item)}
                onPressDots={() => {
                  setSelectedFolder(item);
                  setIcon(item?.icon ?? 'mountain');
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
        <BottomSheetScrollView contentContainerStyle={styles.innerView}>
          {modalType === 'OPTIONS' && selectedFolder && (
            <>
              <View style={styles.largeContainer}>
                <View style={styles.left}>
                  <LargeFolder2Icon
                    shared={selectedFolder.shared}
                    color={selectedFolder.color}
                  />
                  <View style={styles.folderContent}>
                    <Text style={styles.title}>{selectedFolder.name}</Text>
                    <Text style={styles.subtitle}>
                      {toFormattedDate(selectedFolder.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>

              {FOLDER_OPTIONS.map(x => {
                // eslint-disable-next-line @typescript-eslint/no-shadow
                const { name: title, icon, key } = x;

                return (
                  <Pressable
                    onPress={() => {
                      handleFolderOptions(key);
                    }}
                    style={styles.optionsContainer}
                    key={key}
                  >
                    <View style={styles.sortTextContainer}>
                      {icon}
                      <Text style={styles.optionsTitle}>{title}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}

          {modalType === 'SORT' && (
            <BottomSheetScrollView>
              {SORT_CRITERIA.map(x => {
                // eslint-disable-next-line @typescript-eslint/no-shadow
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

          {modalType === 'SHARE' && selectedFolder && (
            <>
              <View style={styles.largeContainer}>
                <View style={styles.left}>
                  <LargeFolder2Icon
                    shared={true}
                    color={selectedFolder.color}
                  />
                  <View style={styles.folderContent}>
                    <Text style={styles.title}>{selectedFolder.name}</Text>
                    <Text style={styles.subtitle}>
                      {toFormattedDate(selectedFolder.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.label}>Send to</Text>
              <View style={styles.inputContainer}>
                <View style={styles.tagContainer}>
                  {contactsList.map(contact => (
                    <View key={contact.id} style={styles.tag}>
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
                  ?.filter(x => x.id !== userData?.id)
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
              {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
              <Pressable onPress={shareFolder} style={styles.button}>
                {isSharing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Share</Text>
                )}
              </Pressable>
            </>
          )}

          {(modalType === 'CREATE' || modalType === 'UPDATE') && (
            <>
              <Text style={styles.label}>Folder Name</Text>
              <View style={styles.inputContainer}>
                <BottomSheetTextInput
                  placeholderTextColor="#999"
                  style={styles.input}
                  placeholder="Enter folder name here"
                  value={name}
                  onChangeText={x => setName(x)}
                />
              </View>

              <Text style={styles.label}>Color</Text>
              <ScrollView horizontal>
                {COLORS.map((x, i) => (
                  <Pressable
                    onPress={() => setSelectedColor(x)}
                    key={i}
                    style={[
                      styles.colorContainer,
                      {
                        ...(selectedColor === x && {
                          backgroundColor: hexToRGB(x, 0.2),
                        }),
                      },
                    ]}
                  >
                    <View style={[styles.color, { backgroundColor: x }]} />
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.label}>Icons</Text>
              <BottomSheetScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
              >
                {chunk(Array.from(selectableIconsMap), 1).map(itemChunk => (
                  <View key={itemChunk[0][0]}>
                    {itemChunk.map(item => {
                      const [iconKey, Icon] = item;
                      return (
                        <TouchableOpacity
                          key={iconKey}
                          style={{
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 15,
                            marginBottom: 35,
                            marginTop: 15,
                            backgroundColor:
                              iconKey === icon ? selectedColor : 'transparent',
                          }}
                          onPress={() => setIcon(iconKey)}
                        >
                          <Icon color={iconKey === icon ? '#fff' : '#333'} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </BottomSheetScrollView>
              <Text style={styles.label}>Description</Text>
              <View style={styles.inputContainer}>
                <BottomSheetTextInput
                  placeholderTextColor="#999"
                  style={styles.input}
                  placeholder="Enter folder description"
                  value={description}
                  onChangeText={x => setDescription(x)}
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
              <Pressable
                style={styles.button}
                onPress={modalType === 'CREATE' ? createFolder : updateFolder}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {modalType === 'CREATE' ? 'Create Folder' : 'Update Folder'}
                  </Text>
                )}
              </Pressable>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    sortText: {
      fontFamily: theme.font.medium,
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
      paddingVertical: theme.spacing.sm,
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
    background: {
      backgroundColor: '#f2f2f2',
      borderRadius: 20,
    },
    content: {
      width: '100%',
      marginTop: theme.spacing.xxs,
      height: Dimensions.get('window').height * 0.675,
      paddingBottom: 10,
    },
    scrollview: {
      paddingHorizontal: theme.spacing.md,
    },
    contentScrollview: {
      height: Dimensions.get('window').width,
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
      width: '100%',
      justifyContent: 'space-between',
    },
    headerText: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      padding: '5%',
      backgroundColor: '#fff',
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
