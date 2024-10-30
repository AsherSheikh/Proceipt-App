import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from 'features/api/api-slice';
import { pipe, prop } from 'ramda';
import { State } from './authentication-types';

export const extendedApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    onboardUser: builder.mutation({
      query: body => ({
        url: '/auth/onboard',
        body,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    signupUser: builder.mutation({
      query: body => ({
        url: '/auth/signup',
        body,
        method: 'POST',
      }),
    }),

    readUserEmail: builder.mutation<{ email: string }, { username: string }>({
      query: body => ({
        url: '/auth/username',
        body,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useOnboardUserMutation,
  useReadUserEmailMutation,
  useSignupUserMutation,
} = extendedApi;

const initialState: State = {
  loading: 'none',
  token: '',
};

const slice = 'authentication';

export const {
  reducer,
  actions: { setToken, setLoading },
} = createSlice({
  name: slice,
  initialState,
  reducers: {
    setToken: (state, { payload }: PayloadAction<string>) => {
      state.token = payload;
      state.loading = 'none';
    },

    setLoading: (
      state,
      { payload }: PayloadAction<'email' | 'google' | 'none'>,
    ) => {
      state.loading = payload;
    },
  },
});

const getAuthenticationSlice = (state: State) => state[slice];
const getLogin = pipe(getAuthenticationSlice, prop('login'));
const getToken = pipe(getAuthenticationSlice, prop('token'));
const getIsAuthenticated = pipe(getAuthenticationSlice, prop('token'), Boolean);

export { slice, getLogin, getToken, getIsAuthenticated };
