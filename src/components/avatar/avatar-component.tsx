import React, { useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { styleSheetFactory, useTheme } from 'theme';

export function getInitials(name: string): string {
  if (!name || name === '') {
    return '';
  }

  const [firstName] = name.split(' ');

  return firstName?.charAt(0)?.toUpperCase();
}

type ProfilePhotoProps = {
  name?: string;
  photoURL?: string;
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
};

const colors = ['#4a4a4a'];

const Avatar = ({ children, name, photoURL, size }: ProfilePhotoProps) => {
  const colorReference = useRef<string>(
    colors[Math.floor(Math.random() * colors.length)],
  );

  const [styles] = useTheme(Styles);

  return (
    <>
      {photoURL ? (
        <Image source={{ uri: photoURL }} style={styles.image} />
      ) : (
        <View
          style={[
            styles.placeholderImage,
            { backgroundColor: colorReference.current },
            size === 'small' && styles.small,
            size === 'medium' && styles.medium,
          ]}
        >
          <Text
            style={[
              styles.placeholderImageText,
              size === 'small' && styles.smallText,
              size === 'medium' && styles.mediumText,
            ]}
          >
            {name && getInitials(name)}
          </Text>
          {children}
        </View>
      )}
    </>
  );
};

export default Avatar;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    image: {
      borderRadius: 36,
      height: 55,
      marginRight: 10,
      width: 55,
    },
    medium: {
      borderRadius: 44,
      height: 44,
      marginRight: 10,
      width: 44,
    },
    mediumText: {
      fontSize: 15,
    },
    placeholderImage: {
      alignItems: 'center',
      backgroundColor: theme.colors.text.main,
      borderRadius: 36,
      height: 55,
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      width: 55,
    },
    placeholderImageText: {
      color: theme.colors.text.white,
      fontFamily: theme.font.semibold,
      fontSize: 22,
    },
    small: {
      borderRadius: 36,
      height: 30,
      marginRight: 10,
      width: 30,
    },
    smallText: {
      fontSize: 12,
    },
  }),
);
