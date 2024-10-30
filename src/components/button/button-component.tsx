import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'theme';

import componentStyles from './button-component-styles';

export type ButtonProps = {
  title: string;
  testID?: string;
  onPress?: () => void;
  type?: 'contained' | 'outline' | 'bare';
  color?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  extendedStyles?: StyleProp<ViewStyle>;
};

const ButtonComponent = ({
  color,
  disabled,
  extendedStyles,
  loading,
  onPress,
  testID,
  title,
  type,
  ...rest
}: ButtonProps) => {
  const [styles] = useTheme(componentStyles);

  const isOutline = type === 'outline';
  const isBare = type === 'bare';
  const isAndroid = Platform.OS === 'android';

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      testID={testID ?? ''}
      {...rest}
      style={[
        styles.container,
        isOutline && styles.outline,
        isBare && styles.bare,
        disabled && styles.disabled,
        color === 'primary' && styles.primary,
        color === 'secondary' && styles.secondary,
        extendedStyles && extendedStyles,
      ]}
    >
      <View
        accessibilityRole="button"
        accessible
        style={
          isAndroid && [
            styles.container,
            isOutline && styles.outline,
            isBare && styles.bare,
            disabled && styles.disabled,
            color === 'primary' && styles.primary,
            color === 'secondary' && styles.secondary,
            extendedStyles && extendedStyles,
          ]
        }
        // testID={testIds.Button.View}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              isBare && styles.textBare,
              isOutline && styles.textBare,
              disabled && styles.text,
            ]}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ButtonComponent;
