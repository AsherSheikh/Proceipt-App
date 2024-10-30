import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from 'redux/root-reducer';

export const apiSlice = createApi({
  reducerPath: 'api',
  tagTypes: ['User', 'Folder', 'Receipt', 'ReceiptHistory', 'Notification'],
  refetchOnFocus: true,
  keepUnusedDataFor: 10,
  baseQuery: fetchBaseQuery({
    mode: 'cors',

    // Development Url
    // Make sure the service backend is running
    // baseUrl: 'https://bd8a-154-160-2-250.eu.ngrok.io',

    // Production Url
    baseUrl: 'https://h734z4b9jg.execute-api.eu-west-1.amazonaws.com',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const { token } = state.authentication;

      headers.set('Authorization', `Bearer ${token}`);

      headers.set('Content-Type', 'application/json');

      return headers;
    },
  }),
  endpoints: () => ({}),
});
