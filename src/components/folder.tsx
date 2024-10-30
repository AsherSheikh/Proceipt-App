import { Pressable, StyleSheet, Text, View } from 'react-native';
import { styleSheetFactory, theme, useTheme } from 'theme';
import React from 'react';
import { Folder2Icon } from 'assets/svg/folder';
import { DotsIcon } from 'assets/svg/dots';
import { ReceiptIcon } from 'assets/svg/receipt';
import { hexToRGB } from 'utils/hex-to-rgba';
import { selectableIconsMap } from './icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { RocketIcon } from 'assets/svg/folder/rocket';

export const Folder = ({
  title,
  subtitle,
  onPress,
  color,
  amount = 'GHS 0.00',
  onPressDots,
  icon,
  highlight,
  hideAmount = false,
  organisation = false,
}: {
  title: string;
  color: string;
  subtitle: string;
  onPress: () => void;
  amount?: string;
  onPressDots?: () => void;
  icon: string;
  highlight?: boolean;
  hideAmount?: boolean;
  organisation?: boolean;
}) => {
  const [styles] = useTheme(Styles);
  const Icon = selectableIconsMap.get(icon);
  return (
    <View
      style={[
        styles.container,

        {
          ...(highlight && {
            borderWidth: 1,
            borderColor: theme.colors.success.primary,
          }),
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[styles.left, { width: '85%' }]}
      >
        {organisation ? (
          <Folder2Icon color={hexToRGB(color, 0.5)} />
        ) : (
          <Folder2Icon
            color={hexToRGB(color, 0.1)}
            icon={Icon && <Icon color={color} />}
          />
        )}
        <View style={[styles.content, { width: onPressDots ? '85%' : '95%' }]}>
          <View style={styles.bottom}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            {!hideAmount && <Text style={styles.amount}>{amount}</Text>}
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
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
            zIndex: 9999,
          }}
        >
          <DotsIcon />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const GridFolder = ({
  title,
  subtitle,
  onPress,
  color,
  amount = '$0.00',
  onPressDots,
  icon,
  highlight,
  hideAmount = false,
}: {
  title: string;
  color: string;
  amount?: string;
  subtitle: string;
  onPress: () => void;
  onPressDots?: () => void;
  icon: string;
  highlight?: boolean;
  hideAmount?: boolean;
}) => {
  const [styles] = useTheme(Styles);
  const Icon = selectableIconsMap.get(icon);
  return (
    <View
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
          <Folder2Icon
            color={hexToRGB(color, 0.1)}
            icon={Icon && <Icon color={color} />}
          />
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
      <TouchableOpacity onPress={onPress} style={styles.gridContent}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <View style={styles.gridBottom}>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {!hideAmount && <Text style={styles.gridAmount}>{amount}</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const AddFolder = ({
  title,
  onPress,
  color,
  highlight,
  isReceipt,
}: {
  title: string;
  color: string;
  isReceipt?: boolean;
  highlight?: boolean;
  onPress: () => void;
}) => {
  const [styles] = useTheme(Styles);
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,

        {
          ...(highlight && {
            borderWidth: 1,
            borderColor: theme.colors.success.primary,
          }),
        },
      ]}
    >
      <View style={styles.left}>
        {isReceipt ? (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: hexToRGB(theme.colors.text.main, 0.05),
            }}
          >
            <ReceiptIcon />
          </View>
        ) : (
          <Folder2Icon
            icon={<RocketIcon color={color} />}
            color={hexToRGB(color, 0.2)}
          />
        )}
        <View style={styles.content}>
          <Text style={styles.addTitle}>{title}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const LargeFolder = ({
  title,
  subtitle,
  onPress,
  color,
  onPressDots,
}: {
  title: string;
  color: string;
  subtitle: string;
  shared?: boolean;
  onPress: () => void;
  onPressDots: () => void;
}) => {
  const [styles] = useTheme(Styles);
  return (
    <Pressable onPress={onPress} style={styles.largeContainer}>
      <View style={styles.left}>
        <Folder2Icon color={color} />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <Pressable onPress={onPressDots} style={styles.dot}>
        <DotsIcon />
      </Pressable>
    </Pressable>
  );
};

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    dot: {
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '100%',
      height: 70,
      marginBottom: 15,
      backgroundColor: theme.colors.card.background,
      padding: theme.spacing.xs,
      borderRadius: 15,
    },
    gridContainer: {
      width: '48%',
      marginBottom: 15,
      backgroundColor: theme.colors.card.background,
      padding: theme.spacing.sm,
      borderRadius: 15,
      zIndex: 1,
    },
    content: {
      marginLeft: theme.spacing.sm,
    },
    largeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '100%',
      height: 80,
      backgroundColor: theme.colors.card.background,
      padding: theme.spacing.sm,
      paddingRight: theme.spacing.xxs,
      borderRadius: 15,
      marginRight: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.medium,
      fontSize: 14,
      maxWidth: '60%',
    },
    addTitle: {
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
    folderIcon: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 25,
      borderColor: '#ddd',
    },
    gridContent: {
      marginTop: theme.spacing.sm,
    },
    bottom: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
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
      fontSize: 13,
    },
    gridAmount: {
      color: theme.colors.text.primary,
      fontFamily: theme.font.medium,
      fontSize: 13,
    },
  }),
);
