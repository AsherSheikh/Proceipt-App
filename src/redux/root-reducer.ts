import { combineReducers } from '@reduxjs/toolkit';
import {
  reducer as settingsReducer,
  slice as settingsSlice,
} from 'features/settings/settings-reducer';

import {
  reducer as profileReducer,
  slice as profileSlice,
} from 'features/profile/profile-reducer';

import {
  reducer as authenticationReducer,
  slice as authenticationSlice,
} from 'features/authentication/authentication-reducer';
import {
  reducer as scanReducer,
  slice as scanSlice,
} from 'features/scan/scan-reducer';
import { apiSlice } from 'features/api/api-slice';

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [settingsSlice]: settingsReducer,
  [authenticationSlice]: authenticationReducer,
  [profileSlice]: profileReducer,
  [scanSlice]: scanReducer,
});

const rootState = rootReducer(undefined, { type: '' });

export type RootState = ReturnType<typeof rootReducer>;

export { rootReducer, rootState };
