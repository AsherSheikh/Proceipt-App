import React, {
  ComponentProps,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { theme } from '../../../../theme';
import { InvoiceItem } from '../../../../entities/invoice_item';
import useInvoiceItem from '../../../../hooks/use_invoice_item';
import { DeleteIcon } from '../../../../assets/svg/delete';

export interface ContactListProps
  extends Pick<
    ComponentProps<typeof BottomSheetFlatList>,
    'enableFooterMarginAdjustment'
  > {
  count?: number;
  style?: ViewStyle;
  onItemPress: (item: InvoiceItem) => void;
  onInvoiceItemDeletePress: (item: InvoiceItem) => void;
  onCreateInvoiceItemPress: (name: string) => void;
  onRefresh?: () => void;
}

const keyExtractor = (item: InvoiceItem, index: number) =>
  `${item.name}.${index}`;

const SelectInvoiceItemComponent = ({
  style,
  onRefresh,
  onItemPress,
  onCreateInvoiceItemPress,
  onInvoiceItemDeletePress,
  ...rest
}: ContactListProps) => {
  const [search, setSearch] = useState('');

  // hooks
  const { bottom: bottomSafeArea } = useSafeAreaInsets();

  const { items } = useInvoiceItem();

  //#region variables
  const data = useMemo(() => {
    if (search) {
      return (
        items?.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()),
        ) || []
      );
    }
    return items || [];
  }, [search]);

  //#endregion

  // styles
  const contentContainerStyle = useMemo(
    () => ({
      ...styles.contentContainer,
      ...style,
      paddingBottom: bottomSafeArea,
    }),
    [style, bottomSafeArea],
  );

  // renders
  const renderFlatListItem = useCallback(
    ({ item }: { item: InvoiceItem }) => (
      <TouchableOpacity
        style={styles.invoiceItem}
        onPress={() => {
          onItemPress(item);
        }}
      >
        <View>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: theme.font.bold,
              color: '#000',
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: theme.font.medium,
              color: theme.colors.text.main,
            }}
          >
            Price: {item.price}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => onInvoiceItemDeletePress(item)}
        >
          <DeleteIcon />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [onItemPress],
  );

  return (
    <BottomSheetFlatList
      {...rest}
      data={data}
      ListHeaderComponent={
        <View
          style={{
            marginBottom: 10,
          }}
        >
          <BottomSheetTextInput
            style={styles.search}
            value={search}
            onChangeText={text => setSearch(text)}
            placeholder="Search"
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              onCreateInvoiceItemPress(search);
            }}
          >
            <Text
              style={{
                color: '#fff',
              }}
            >
              Create a new item
            </Text>
          </TouchableOpacity>
        </View>
      }
      stickyHeaderIndices={[0]}
      refreshing={false}
      onRefresh={onRefresh}
      keyExtractor={keyExtractor}
      style={styles.container}
      initialNumToRender={5}
      bounces={true}
      windowSize={10}
      maxToRenderPerBatch={5}
      renderItem={renderFlatListItem}
      keyboardDismissMode="interactive"
      indicatorStyle="black"
      contentContainerStyle={contentContainerStyle}
      focusHook={useFocusEffect}
    />
  );
};

export const SelectInvoiceItem = memo(SelectInvoiceItemComponent);

const styles = StyleSheet.create({
  invoiceItem: {
    alignContent: 'center',
    marginVertical: 5,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: theme.colors.grey.light,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionHeaderContainer: {
    paddingBottom: 6,
    backgroundColor: 'white',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    textTransform: 'uppercase',
    color: 'black',
  },
  container: {
    overflow: 'visible',
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    overflow: 'visible',
  },
  search: {
    fontFamily: theme.font.medium,
    fontSize: 13,
    width: '100%',
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    color: theme.colors.text.primary,
  },
  iconBtn: {
    width: 40,
    backgroundColor: '#fff',
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    zIndex: 9999,
  },
  section: {
    height: 500,
    borderWidth: 2,
    overflow: 'hidden',
  },
  primaryBtn: {
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: theme.colors.text.main,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
