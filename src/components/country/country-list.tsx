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
import { CountryItem } from './country-item';

import CountryData from './data.json';

export interface ContactListProps
  extends Pick<
    ComponentProps<typeof BottomSheetFlatList>,
    'enableFooterMarginAdjustment'
  > {
  count?: number;
  style?: ViewStyle;
  onItemPress?: (item: {
    name: string;
    dial_code: string;
    flag: string;
  }) => void;
  onRefresh?: () => void;
}

const keyExtractor = (item: any, index: number) => `${item.name}.${index}`;

const CountryListComponent = ({
  style,
  onRefresh,
  onItemPress,
  ...rest
}: ContactListProps) => {
  const [search, setSearch] = useState('');

  // hooks
  const { bottom: bottomSafeArea } = useSafeAreaInsets();

  //#region variables
  const data = useMemo(() => {
    if (search) {
      return CountryData.map(x => ({ ...x, name: x.name.en })).filter(y =>
        y.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return CountryData.map(x => ({ ...x, name: x.name.en }));
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
      <CountryItem
        key={`${item.name}.${index}`}
        icon={item.flag}
        title={item.dial_code}
        subTitle={item.name}
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

export const CountryList = memo(CountryListComponent);
