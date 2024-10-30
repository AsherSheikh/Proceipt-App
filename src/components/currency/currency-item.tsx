import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { theme } from 'theme';

interface CountryItemProps {
  title: string;
  subTitle?: string;
  icon?: string;
  titleStyle?: TextStyle;
  subTitleStyle?: TextStyle;
  thumbnailStyle?: ViewStyle;
  onPress?: () => void;
}

const CurrencyItemComponent = ({
  title,
  subTitle,
  subTitleStyle,
  onPress,
  icon,
}: CountryItemProps) => {
  const ContentWrapper = useMemo<any>(
    () => (onPress ? TouchableOpacity : View),
    [onPress],
  );
  // render
  return (
    <ContentWrapper onPress={onPress} style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={[styles.title]}>
          <Text style={{ color: '#367CC9', paddingRight: 15 }}>{icon}</Text>
          {`  ${title}`}
        </Text>
        {subTitle && (
          <Text numberOfLines={1} style={[styles.subtitle, subTitleStyle]}>
            {`${subTitle}`.toUpperCase()}
          </Text>
        )}
      </View>
    </ContentWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    marginVertical: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: '#333',
    fontSize: 14,
    marginRight: 10,
    textTransform: 'capitalize',
    fontFamily: theme.font.medium,
  },

  subtitle: {
    color: '#333',
    fontSize: 14,
    fontFamily: theme.font.regular,
  },
});

export const CurrencyItem = memo(CurrencyItemComponent);
