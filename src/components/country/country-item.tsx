import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from '@gorhom/bottom-sheet';

interface CountryItemProps {
  title: string;
  subTitle?: string;
  icon?: string;
  titleStyle?: TextStyle;
  subTitleStyle?: TextStyle;
  thumbnailStyle?: ViewStyle;
  onPress?: () => void;
}

const CountryItemComponent = ({
  title,
  subTitle,
  titleStyle,
  subTitleStyle,
  thumbnailStyle,
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
      <View style={[styles.thumbnail, thumbnailStyle]}>
        <Text style={[styles.title, titleStyle]}>{icon}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subTitle && (
          <Text numberOfLines={1} style={[styles.subtitle, subTitleStyle]}>
            {subTitle}
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
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingLeft: 30,
  },
  contentContainer: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  thumbnail: {
    width: 46,
    height: 46,
    borderRadius: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.125)',
  },
  title: {
    color: '#111',
    fontSize: 14,
    width: 50,
    marginRight: 10,
    textTransform: 'capitalize',
  },

  subtitle: {
    color: '#666',
    fontSize: 14,
    maxWidth: 200,
    textTransform: 'capitalize',
  },
});

export const CountryItem = memo(CountryItemComponent);
