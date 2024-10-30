import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styleSheetFactory, theme, useTheme } from 'theme';
import React from 'react';
import { ReceiptIcon } from 'assets/svg/receipt';
import { DotsIcon } from 'assets/svg/dots';
import { Star } from 'assets/svg/star';

export const Receipt = ({
  title,
  subtitle,
  total,
  onPress,
}: {
  title: string;
  subtitle: string;
  total: string;
  onPress: () => void;
}) => {
  const [styles] = useTheme(Styles);
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <ReceiptIcon />
        </View>
        <View>
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.total}>{total}</Text>
    </Pressable>
  );
};

export const GridReceipt = ({
  title,
  subtitle,
  total,
  onPress,
  highlight,
  onPressDots,
}: {
  highlight?: boolean;
  favorite?: boolean;
  title: string;
  subtitle: string;
  total: string;
  owner?: boolean;
  onPress: () => void;
  onPressDots?: () => void;
}) => {
  const [styles] = useTheme(Styles);
  return (
    <Pressable
      onLongPress={() => onPressDots?.()}
      onPress={onPress}
      style={[
        styles.gridContainer,
        {
          ...(highlight && {
            borderWidth: 1,
            borderColor: theme.colors.success.primary,
          }),
        },
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={onPress}>
          <View style={styles.iconContainer}>
            <ReceiptIcon />
          </View>
        </TouchableOpacity>

        {onPressDots && (
          <TouchableOpacity
            onPress={onPressDots}
            style={{
              backgroundColor: '#f5f5f5',
              width: 32,
              height: 32,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
            }}
          >
            <DotsIcon />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.gridContent}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <View style={styles.gridBottom}>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.gridAmount}>{total}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const AltReceipt = ({
  title,
  subtitle,
  total,
  onPress,
  onPressDots,
  favorite,
  highlight,
}: {
  favorite?: boolean;
  highlight?: boolean;
  title: string;
  subtitle: string;
  total: string;
  owner?: boolean;
  onPress?: () => void;
  onPressDots?: () => void;
}) => {
  const [styles] = useTheme(Styles);
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.altContainer,
        {
          ...(highlight && {
            borderWidth: 1,
            borderColor: theme.colors.success.primary,
          }),
        },
      ]}
    >
      <View style={styles.altLeft}>
        <View style={styles.iconContainer}>
          <ReceiptIcon />
        </View>
        <View
          style={{ width: onPressDots ? '80%' : '95%', alignItems: 'center' }}
        >
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text numberOfLines={1} style={styles.altTitle}>
              {`${title} `}
              {favorite && <Star />}
            </Text>

            <Text numberOfLines={1} style={styles.altTitle}>
              {total}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.altSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>
      {onPressDots && (
        <TouchableOpacity
          onPress={onPressDots}
          style={{
            backgroundColor: '#f5f5f5',
            width: 32,
            height: 32,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <DotsIcon />
        </TouchableOpacity>
      )}
    </Pressable>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    dots: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },

    iconContainer: {
      backgroundColor: theme.colors.icon.background,
      width: 50,
      height: 50,
      borderRadius: 10,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    altContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      backgroundColor: '#fff',
      padding: theme.spacing.xs,
      borderRadius: 15,
      width: '100%',
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    altLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '83%',
    },
    title: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      fontSize: 15,
    },
    altTitle: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      fontSize: 14,
      maxWidth: '100%',
    },
    altTotal: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginTop: theme.spacing.xxs,
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
    altSubtitle: {
      color: theme.colors.text.light,
      fontFamily: theme.font.regular,
      fontSize: 12,
      marginTop: theme.spacing.xxs,
      textAlign: 'left',
      width: '100%',
    },
    gridContainer: {
      width: '48%',
      marginBottom: 15,
      backgroundColor: theme.colors.card.background,
      padding: theme.spacing.sm,
      borderRadius: 15,
    },
    gridContent: {
      marginTop: theme.spacing.sm,
    },
    bottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xxs,
    },
    gridBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    amount: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      fontSize: 15,
    },
    gridAmount: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      fontSize: 13,
    },
  }),
);
