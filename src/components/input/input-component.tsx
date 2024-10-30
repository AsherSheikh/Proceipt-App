import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { propEq } from 'ramda';
import React, { forwardRef, useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  UIManager,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useTheme } from 'theme';

import componentStyles from './input-component-styles';

export interface InputProps extends TextInputProps {
  label?: string;
  info?: string;
  error?: boolean;
  icon?: JSX.Element;
  showIcon?: boolean;
  disabled?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    { disabled, error, icon: Icon, info, label, showIcon, testID, ...rest },
    reference,
  ) => {
    const [styles, theme] = useTheme(componentStyles);

    const [isFocused, setIsFocued] = useState(false);

    const onFocus = () => setIsFocued(true);
    const onBlur = () => {
      setIsFocued(false);
    };

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.outline,
            isFocused && styles.focusedOutline,
            error && styles.errorOutline,
          ]}
          testID="Outline"
        >
          <View
            style={[
              styles.inputContainer,
              isFocused && styles.focusedInputContainer,
              disabled && styles.disabledInputContainer,
              error && styles.errorInputContainer,
            ]}
            testID={testID}
          >
            <TextInput
              editable={!disabled}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholderTextColor={theme.colors.placeholder}
              ref={reference}
              selectTextOnFocus={!disabled}
              style={styles.input}
              {...rest}
            />
            {Icon && showIcon && Icon}
          </View>
        </View>
        {(info || error) && (
          <Text
            style={[styles.info, error && styles.errorInfo]}
            testID={`Error${testID}`}
          >
            {info ?? ''}
          </Text>
        )}
      </View>
    );
  },
);

const BSInput = forwardRef<any, InputProps>(
  (
    { disabled, error, icon: Icon, info, label, showIcon, testID, ...rest },
    reference,
  ) => {
    const [styles, theme] = useTheme(componentStyles);

    const [isFocused, setIsFocued] = useState(false);

    const onFocus = () => setIsFocued(true);
    const onBlur = () => {
      setIsFocued(false);
    };

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.outline,
            isFocused && styles.focusedOutline,
            error && styles.errorOutline,
          ]}
          testID="Outline"
        >
          <View
            style={[
              styles.inputContainer,
              isFocused && styles.focusedInputContainer,
              disabled && styles.disabledInputContainer,
              error && styles.errorInputContainer,
            ]}
            testID={testID}
          >
            <BottomSheetTextInput
              editable={!disabled}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholderTextColor={theme.colors.placeholder}
              ref={reference}
              selectTextOnFocus={!disabled}
              style={styles.input}
              {...rest}
            />
            {Icon && showIcon && Icon}
          </View>
        </View>
        {(info || error) && (
          <Text
            style={[styles.info, error && styles.errorInfo]}
            testID={`Error${testID}`}
          >
            {info ?? ''}
          </Text>
        )}
      </View>
    );
  },
);

export interface PhoneInputProps extends TextInputProps {
  label: string;
  info: string;
  error: boolean;
  country: string;
  icon?: JSX.Element;
  disabled?: boolean;
}

const PhoneInput = forwardRef<any, PhoneInputProps>(
  ({ country, disabled, error, info, label, testID, ...rest }, reference) => {
    const [isFocused, setIsFocued] = useState(false);

    const [styles, theme] = useTheme(componentStyles);

    const onFocus = () => setIsFocued(true);
    const onBlur = () => {
      setIsFocued(false);
    };

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.outline,
            isFocused && styles.focusedOutline,
            error && styles.errorOutline,
          ]}
          testID="Outline"
        >
          <View
            style={[
              styles.inputContainer,
              isFocused && styles.focusedInputContainer,
              disabled && styles.disabledInputContainer,
              error && styles.errorInputContainer,
            ]}
            testID={testID}
          >
            <Text style={styles.countryCode}>{country}</Text>
            <TextInput
              editable={!disabled}
              onBlur={onBlur}
              onFocus={onFocus}
              placeholderTextColor={theme.colors.placeholder}
              ref={reference}
              selectTextOnFocus={!disabled}
              style={styles.input}
              {...rest}
            />
          </View>
        </View>
        {(info || error) && (
          <Text
            style={[styles.info, error && styles.errorInfo]}
            testID={`Error${testID}`}
          >
            {info ?? ''}
          </Text>
        )}
      </View>
    );
  },
);

interface SelectProps {
  label: string;
  info: string;
  error: boolean;
  disabled?: boolean;
  options: {
    label: string;
    nodeLabel?: JSX.Element;
    value: string;
  }[];
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
}

const Select = ({
  disabled,
  error,
  info,
  label,
  onChange,
  options,
  placeholder,
  value,
}: SelectProps) => {
  if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const [styles] = useTheme(componentStyles);
  const [isFocused, setIsFocued] = useState(false);
  const [option, setOption] = useState('');

  const onOpenDropdown = () => setIsFocued(!isFocused);
  const onSelectItem = (item: string) => {
    setOption(item);
    setIsFocued(false);
    onChange?.(item);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  useEffect(() => {
    if (value) {
      setOption(value);
    }
  }, [value]);

  return (
    <View style={styles.selectInputContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.outline,
            isFocused && styles.focusedOutline,
            error && styles.errorOutline,
          ]}
          testID="Outline"
        >
          <View
            style={[
              styles.selectContainer,
              isFocused && styles.focusedSelectInputContainer,
              error && styles.errorSelectInputContainer,
              disabled && styles.disabledSelectInputContainer,
            ]}
          >
            <RectButton
              onPress={() => {
                onOpenDropdown();
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
              }}
              style={styles.selectInput}
              testID="SelectContainer"
            >
              <View style={styles.input}>
                {option ? (
                  <Text style={styles.selectValue}>
                    {options?.find(propEq('value', option))?.nodeLabel ??
                      options?.find(propEq('value', option))?.label ??
                      ''}
                  </Text>
                ) : (
                  <Text style={styles.placeholder}>{placeholder}</Text>
                )}
              </View>
            </RectButton>
            {isFocused && (
              <View style={styles.searchContainer}>
                <ScrollView nestedScrollEnabled>
                  {options.map((item, index) => (
                    <RectButton
                      key={index}
                      onPress={() => onSelectItem(item.value)}
                      style={[
                        styles.selectItem,
                        item.value === value && styles.selectedItem,
                      ]}
                    >
                      {item.nodeLabel ?? (
                        <Text style={styles.selectItemText}>{item.label}</Text>
                      )}
                    </RectButton>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
        {(info || error) && (
          <Text style={[styles.info, error && styles.errorInfo]}>
            {info ?? ''}
          </Text>
        )}
      </View>
    </View>
  );
};

export { BSInput, Input, PhoneInput, Select };
