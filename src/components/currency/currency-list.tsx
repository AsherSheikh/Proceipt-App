import React, {
  ComponentProps,
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { styles } from './styles';
import { CurrencyItem } from './currency-item';
import { getAllISOCodes } from 'iso-country-currency';

export interface CurrencyListProps
  extends Pick<
    ComponentProps<typeof BottomSheetFlatList>,
    'enableFooterMarginAdjustment'
  > {
  count?: number;
  style?: ViewStyle;
  onItemPress?: (item: { countryName: string; currency: string }) => void;
  onRefresh?: () => void;
}

const keyExtractor = (item: any, index: number) => `${item.name}.${index}`;

const CurrencyListComponent = ({
  style,
  onRefresh,
  onItemPress,
  ...rest
}: CurrencyListProps) => {
  const [search, setSearch] = useState('');

  // hooks
  const { bottom: bottomSafeArea } = useSafeAreaInsets();

  const currencyData = getAllISOCodes().map(x => ({
    country: x.countryName,
    currency: x.currency.toUpperCase(),
    symbol: x.symbol,
  }));

  //#region variables
  const data = useMemo(() => {
    if (search) {
      return currencyData.filter(
        y =>
          y.country.toLowerCase().includes(search.toLowerCase()) ||
          y.currency.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return currencyData;
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
    ({ item, index }) => (
      <CurrencyItem
        key={`${item.currency}.${index}`}
        title={item.country}
        icon={item.symbol}
        subTitle={item.currency}
        onPress={() => onItemPress?.(item)}
      />
    ),
    [onItemPress],
  );

  return (
    <BottomSheetFlatList
      {...rest}
      data={data}
      ListHeaderComponent={
        <BottomSheetTextInput
          style={styles.search}
          value={search}
          onChangeText={text => setSearch(text)}
          placeholder="Search"
          placeholderTextColor="#999"
        />
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

export const CurrencyList = memo(CurrencyListComponent);
