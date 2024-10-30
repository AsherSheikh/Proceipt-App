import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { pipe, prop } from 'ramda';

import { clear } from '../../redux/clear';
import { RootState } from '../../redux/root-reducer';

type ColorScheme = 'system' | 'light' | 'dark';

export type SettingsState = {
  enableNotifications: boolean;
  enableEmails: boolean;
  enableBiometrics: boolean;
  isDarkMode: ColorScheme;
  fcmToken: string;
  hasPin: boolean;
  isFirstTimeOpen: boolean;
  hasRatedApp: boolean;
  startedAppCounter: number;
  rateAppTriggerCount: number;
  showWalkthrough: boolean;
};

const slice = 'settings';

const initialState: SettingsState = {
  enableNotifications: true,
  enableEmails: true,
  isDarkMode: 'system',
  enableBiometrics: false,
  fcmToken: '',
  hasPin: false,
  isFirstTimeOpen: true,
  hasRatedApp: false,
  startedAppCounter: 0,
  rateAppTriggerCount: 5,
  showWalkthrough: true,
};

export const {
  actions: {
    incrementStartedAppCounter,
    setDarkMode,
    setEnableBiometrics,
    setEnableNotifications,
    setFcmToken,
    setHasRatedApp,
    setIsFirstTimeOpen,
    setEnableEmails,
    setShowWalkthough,
  },
  reducer,
} = createSlice({
  name: slice,
  initialState,
  reducers: {
    setEnableNotifications: (state, { payload }: PayloadAction<boolean>) => {
      state.enableNotifications = payload;
    },
    setEnableEmails: (state, { payload }: PayloadAction<boolean>) => {
      state.enableEmails = payload;
    },
    setEnableBiometrics: (state, { payload }: PayloadAction<boolean>) => {
      state.enableBiometrics = payload;
    },
    setHasRatedApp: (state, { payload }: PayloadAction<boolean>) => {
      state.hasRatedApp = payload;
    },
    incrementStartedAppCounter: state => {
      state.startedAppCounter = (state.startedAppCounter || 0) + 1;
    },
    incrementRateAppTrigger: state => {
      state.startedAppCounter = (state.rateAppTriggerCount || 0) + 10;
    },
    setDarkMode: (state, { payload }: PayloadAction<ColorScheme>) => {
      state.isDarkMode = payload;
    },
    setFcmToken: (state, { payload }: PayloadAction<string>) => {
      state.fcmToken = payload;
    },
    setIsFirstTimeOpen: (state, { payload }: PayloadAction<boolean>) => {
      state.isFirstTimeOpen = payload;
    },
    setShowWalkthough: (state, { payload }: PayloadAction<boolean>) => {
      state.showWalkthrough = payload;
    },
  },
  extraReducers: {
    [clear.type]: () => initialState,
  },
});

const getSettingsSlice = (state: RootState) => state[slice];
const isNotificationsEnabled = pipe(
  getSettingsSlice,
  prop('enableNotifications'),
);
const isBiometricsEnabled = pipe(getSettingsSlice, prop('enableBiometrics'));

const getFcmToken = pipe(getSettingsSlice, prop<'fcmToken'>('fcmToken'));
const getLoggedInCount = pipe(
  getSettingsSlice,
  prop<'startedAppCounter'>('startedAppCounter'),
);
const getHasRatedApp = pipe(
  getSettingsSlice,
  prop<'hasRatedApp'>('hasRatedApp'),
);
const getHasPin = pipe(getSettingsSlice, prop<'hasPin'>('hasPin'));
const getShowWalkthrough = pipe(getSettingsSlice, prop('showWalkthrough'));
const getEnableEmail = pipe(getSettingsSlice, prop('enableEmails'));
const getDarkMode = pipe(getSettingsSlice, prop<'isDarkMode'>('isDarkMode'));
const getIsFirstTimeOpen = pipe(
  getSettingsSlice,
  prop<'isFirstTimeOpen'>('isFirstTimeOpen'),
);

export {
  getDarkMode,
  getFcmToken,
  getHasPin,
  getShowWalkthrough,
  getHasRatedApp,
  getIsFirstTimeOpen,
  getLoggedInCount,
  getSettingsSlice,
  getEnableEmail,
  isBiometricsEnabled,
  isNotificationsEnabled,
  slice,
};
