import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from 'features/api/api-slice';
import { pipe, prop } from 'ramda';
import { RootState } from 'redux/root-reducer';
import { User } from '../../utils/type';

export const endpoints = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    readUser: builder.query<User, void>({
      query: () => '/user',
      providesTags: ['User'],
    }),
    readUsers: builder.mutation<User[], string>({
      query: query => `/user/search?query=${query}`,
    }),
    updateUser: builder.mutation<User, Partial<User>>({
      query: body => ({
        url: '/user',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateFcmToken: builder.mutation<any, { token: string }>({
      query: body => ({
        url: '/user/fcm',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation({
      query: () => ({
        url: '/user',
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useDeleteUserMutation,
  useReadUsersMutation,
  useUpdateUserMutation,
  useReadUserQuery,
  useLazyReadUserQuery,
  useUpdateFcmTokenMutation,
  endpoints: { readUser },
} = endpoints;

type State = {
  onboarded: boolean;
  isAuthenticated: boolean;
  user: User | null;
};

const slice = 'userProfile';
export const initialState: State = {
  onboarded: false,
  isAuthenticated: false,
  user: null,
};

export const {
  reducer,
  actions: { setOnboarded, setIsAuthenticated },
} = createSlice({
  name: slice,
  initialState,
  reducers: {
    setOnboarded: (state, { payload }) => {
      state.onboarded = payload;
    },
    setIsAuthenticated: (state, { payload }) => {
      state.isAuthenticated = payload;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      isAnyOf(readUser.matchFulfilled),
      (state, { payload }: PayloadAction<User | null>) => {
        state.user = payload;
      },
    );
  },
});

const getProfileSlice = (state: RootState) => state[slice];

const getOnboarded = pipe(getProfileSlice, prop('onboarded'));
const getUser = pipe(getProfileSlice, prop('user'));
const getIsAuthenticated = pipe(getProfileSlice, prop('isAuthenticated'));
export { slice, getOnboarded, getIsAuthenticated, getUser };
