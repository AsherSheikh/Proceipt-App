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
import useCustomer from '../../../../hooks/use_customer';
import { theme } from '../../../../theme';
import { Customer } from '../../../../entities/customer';

export interface ContactListProps
  extends Pick<
    ComponentProps<typeof BottomSheetFlatList>,
    'enableFooterMarginAdjustment'
  > {
  count?: number;
  style?: ViewStyle;
  onItemPress: (item: Customer) => void;
  onCreateCustomerPress: (name: string) => void;
  onRefresh?: () => void;
}

const keyExtractor = (item: Customer, index: number) => `${item.name}.${index}`;

const SelectCustomerComponent = ({
  style,
  onRefresh,
  onItemPress,
  onCreateCustomerPress,
  ...rest
}: ContactListProps) => {
  const [search, setSearch] = useState('');

  // hooks
  const { bottom: bottomSafeArea } = useSafeAreaInsets();

  const { customers } = useCustomer();

  //#region variables
  const data = useMemo(() => {
    if (search) {
      return (
        customers?.filter(
          c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()),
        ) || []
      );
    }
    return customers || [];
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
    ({ item, index }: { item: Customer; index: number }) => (
      <TouchableOpacity
        style={styles.customerItem}
        onPress={() => {
          onItemPress(item);
        }}
      >
        <Text
          numberOfLines={1}
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
            fontFamily: theme.font.regular,
          }}
        >
          {item.email || '-'}
        </Text>
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
              onCreateCustomerPress(search);
            }}
          >
            <Text
              style={{
                color: '#fff',
              }}
            >
              Create a customer
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

export const SelectCustomer = memo(SelectCustomerComponent);

const styles = StyleSheet.create({
  customerItem: {
    alignContent: 'center',
    marginVertical: 5,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: theme.colors.grey.light,
    borderRadius: 10,
    padding: 10,
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
