/* eslint-disable react-native/no-inline-styles */
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParameterList } from 'navigation/navigator';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import OnboardingItem from './onboarding_item';
import { OnboardingData } from '../../utils/type';

const onboardingData: OnboardingData[] = [
  {
    id: '1',
    title: 'Capture Every Expense',
    lottie: require('../../assets/lottie/receipt_2.json'),
    text: 'Our AI powered tool lets you scan receipts and report its details with OCR technology.',
  },
  {
    id: '2',
    title: 'Create Folders',
    lottie: require('../../assets/lottie/folder.json'),
    text: 'Categorise all your expenses into different folders as you want. Clutter free!',
  },
  {
    id: '3',
    title: 'Invoicing Made Easy',
    lottie: require('../../assets/lottie/invoice.json'),
    text: 'Make and send invoices with payment reminders anytime, anywhere.',
  },
];

const screenWidth = Dimensions.get('window').width;

const OnBoarding = () => {
  const flatListRef: React.Ref<FlatList<OnboardingData>> = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const ind = event.nativeEvent.contentOffset.x / screenWidth;
    const roundIndex = Math.round(ind);
    setCurrentIndex(roundIndex);
  };

  const { navigate } = useNavigation<NavigationProp<AuthStackParameterList>>();

  const handleContinuePress = () => {
    if (currentIndex === onboardingData.length - 1) {
      navigate('GetStarted');
    } else {
      flatListRef?.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f7f9fc',
      }}
    >
      <FlatList
        data={onboardingData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        renderItem={({ item }) => (
          <OnboardingItem item={item} onContinuePress={handleContinuePress} />
        )}
        keyExtractor={(item, index) => item.id + index}
        onScroll={onScroll}
        ref={flatListRef}
      />
    </View>
  );
};

export default OnBoarding;
