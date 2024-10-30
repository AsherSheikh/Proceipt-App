import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { styleSheetFactory, theme, useTheme } from 'theme';
import { LeftArrow } from 'assets/svg/left-arrow';
import { SearchIcon } from 'assets/svg/search';
import { ArrowRightIcon } from 'assets/svg/arrow-right';
import { useNavigation } from '@react-navigation/native';
import {
  useReadUserQuery,
  useUpdateUserMutation,
} from 'features/profile/profile-reducer';
import { Platform } from 'expo-modules-core';

const NAME = {
  preferredName: {
    name: 'Preferred Name',
  },
  name: {
    name: 'Full name',
  },
  email: {
    name: 'Email',
  },
  phoneNumber: {
    name: 'Phone number',
  },
};

export default function ProfileSettingsScreen() {
  const [styles] = useTheme(Styles);
  const [selected, setSelected] = useState<
    null | 'name' | 'preferredName' | 'phoneNumber' | string
  >(null);
  const [value, setValue] = useState('');
  const { goBack } = useNavigation();

  const [updateProfile, { isLoading }] = useUpdateUserMutation();

  const { data } = useReadUserQuery();

  const menuList = useMemo(() => {
    if (data) {
      return [
        { title: 'Name', subtitle: data.name, link: 'name' },
        {
          title: 'Email',
          subtitle: data.email,
          link: 'email',
        },
        {
          title: 'Phone',
          subtitle: data.phoneNumber,
          link: 'phoneNumber',
        },
      ];
    } else {
      return [];
    }
  }, [data]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} />
    ),
    [],
  );
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['1%', '40%'], []);

  const onUpdateField = async (
    field: 'name' | 'preferredName' | 'phone' | string,
  ) => {
    await updateProfile({
      [field]: value,
    }).unwrap();

    setValue('');
    bottomSheetRef.current?.close();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable onPress={() => goBack()} style={styles.leftHeader}>
            <LeftArrow color={theme.colors.text.darkGrey} />
            <Text style={styles.headerText}>Your Details</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              bottomSheetRef.current?.snapToIndex(1);
            }}
          >
            <SearchIcon />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={styles.scrollviewContent}
          style={styles.scrollview}
        >
          {menuList.map(x => (
            <Pressable
              onPress={() => {
                x.link !== 'preferredName' && setSelected(x.link);
                setValue(x.subtitle ?? '');
                bottomSheetRef.current?.snapToIndex(1);
              }}
              key={x.title}
              style={styles.item}
            >
              <View>
                <Text style={styles.itemTitle}>{x.title}</Text>
                <Text style={styles.itemSubtitle}>{x.subtitle}</Text>
              </View>
              <View style={styles.iconButton}>
                {x.link !== 'preferredName' && (
                  <ArrowRightIcon color="#5b5b5b" />
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <BottomSheet
          detached
          backgroundComponent={renderBackdrop}
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          style={styles.background}
        >
          <BottomSheetView style={styles.innerView}>
            <Text style={styles.label}>
              {selected ? NAME[selected]?.name ?? '' : ''}
            </Text>

            <View style={styles.inputContainer}>
              <BottomSheetTextInput
                placeholderTextColor="#999"
                placeholder={selected ? NAME[selected]?.name ?? '' : ''}
                onChangeText={text => setValue(text)}
                value={value}
                style={styles.input}
              />
            </View>
            <Pressable
              style={styles.button}
              onPress={() => selected && onUpdateField(selected)}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </Pressable>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
}

const Styles = styleSheetFactory(theme =>
  StyleSheet.create({
    button: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.button.background,
      color: theme.colors.button.color,
      borderRadius: 14,
      minHeight: 55,
      width: '100%',
      marginTop: theme.spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      fontFamily: theme.font.regular,
      fontSize: 13,
      color: '#000',
    },
    inputContainer: {
      paddingVertical:
        Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.xxxs,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderRadius: 14,
      borderColor: theme.colors.input.outline,
      backgroundColor: theme.colors.input.background,
      marginTop: theme.spacing.sm,
    },
    label: {
      fontFamily: theme.font.medium,
      color: theme.colors.text.primary,
    },
    buttonText: {
      fontFamily: theme.font.medium,
      color: theme.colors.button.color,
    },
    innerView: {
      padding: '5%',
      backgroundColor: '#fff',
    },
    background: {
      backgroundColor: '#fff',
      borderRadius: 20,
    },
    item: {
      padding: theme.spacing.sm,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 0.5,
      borderColor: '#f2f2f2',
    },
    iconButton: {
      width: 30,
      height: 50,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
      fontFamily: theme.font.medium,
      fontSize: 16,
    },
    itemSubtitle: {
      color: theme.colors.text.dark,
      fontFamily: theme.font.regular,
      fontSize: 14,
    },
    scrollviewContent: {
      borderRadius: 15,
      overflow: 'hidden',
    },
    featuredItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    featuredItemText: {
      color: theme.colors.text.white,
      fontFamily: theme.font.medium,
      fontSize: 14,
      marginLeft: theme.spacing.xs,
    },
    featuredItemContainer: {
      width: '90%',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'space-around',
      minHeight: 70,
      borderRadius: 20,
      backgroundColor: '#0032FA',
      position: 'absolute',
      top: -35,
      flexDirection: 'row',
      zIndex: 1000,
    },
    content: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f2f2f2',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      marginTop: theme.spacing.xxs,
      zIndex: 1000,
    },
    scrollview: {
      padding: theme.spacing.md,
    },
    profileContainer: {
      width: 110,
      height: 110,
      borderRadius: 110,
      borderWidth: 1,
      borderColor: theme.colors.text.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 100,
      backgroundColor: theme.colors.text.white,
    },
    container: {
      flex: 1,
    },
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
      padding: '5%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  }),
);
