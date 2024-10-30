import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { styleSheetFactory, theme, useTheme } from 'theme';
import React from 'react';
import { Notification as NotificationType } from 'utils/type';
import { formatDistanceToNow } from 'date-fns';

export const Notification = ({
  item,
  onPress,
}: {
  item: NotificationType;
  onPress: () => void;
}) => {
  const [styles] = useTheme(Styles);
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.left, { width: '100%' }]}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 60,
            backgroundColor: '#ddd',
          }}
        >
          <Image
            source={{ uri: item.logoURL }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 60,
            }}
          />
          {item.status === 'NEW' && (
            <View
              style={{
                width: 20,
                height: 20,
                borderWidth: 3,
                borderColor: '#fff',
                borderRadius: 60,
                backgroundColor: theme.colors.error.primary,
                position: 'absolute',
                top: -2.5,
                right: -2.5,
              }}
            />
          )}
        </View>
        <View style={[styles.content, { width: '75%' }]}>
          <View style={styles.bottom}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <Text style={styles.subtitle}>
            {formatDistanceToNow(new Date(item.createdAt))}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '100%',
      height: 70,
      marginBottom: 15,
      backgroundColor: theme.colors.card.background,
      padding: theme.spacing.sm,
      borderRadius: 15,
    },
    content: {
      marginLeft: theme.spacing.sm,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      fontSize: 14,
      maxWidth: '100%',
    },
    total: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      fontSize: 12,
    },
    subtitle: {
      color: theme.colors.text.light,
      fontFamily: theme.font.regular,
      fontSize: 12,
    },
    bottom: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
  }),
);
