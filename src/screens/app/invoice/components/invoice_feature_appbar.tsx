import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styleSheetFactory, theme, useTheme } from '../../../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { LeftArrow } from '../../../../assets/svg/left-arrow';

type Props = {
  title: string;
  onPress?: () => void;
  buttonText: string;
  showBack?: boolean;
};

const InvoiceFeatureAppbar = ({
  title,
  onPress,
  buttonText,
  showBack,
}: Props) => {
  const [styles] = useTheme(Styles);
  const insets = useSafeAreaInsets();
  const { goBack } = useNavigation();
  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={showBack ? goBack : undefined}
          style={styles.leftHeader}
        >
          {showBack && <LeftArrow color={theme.colors.text.darkGrey} />}
          <Text style={styles.headerText}>{title}</Text>
        </Pressable>
        <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
          <Text
            style={{
              color: 'white',
              fontFamily: theme.font.medium,
            }}
          >
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InvoiceFeatureAppbar;

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    leftHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerText: {
      color: theme.colors.text.darkGrey,
      fontFamily: theme.font.semibold,
      fontSize: 16,
      marginLeft: theme.spacing.xs,
    },
    wrapper: {
      backgroundColor: '#fff',
      padding: '5%',
    },
    header: {
      paddingTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    primaryBtn: {
      borderRadius: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.colors.text.main,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
  }),
);
