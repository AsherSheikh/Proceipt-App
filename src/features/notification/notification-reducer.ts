import { apiSlice } from 'features/api/api-slice';
import { Notification } from 'utils/type';

export const { useReadAllNotificationsQuery, useMarkAsReadMutation } =
  apiSlice.injectEndpoints({
    overrideExisting: true,
    endpoints: builder => ({
      readAllNotifications: builder.query<Notification[], void>({
        query: () => '/notification',
        providesTags: ['Notification'],
      }),
      markAsRead: builder.mutation<void, number>({
        query: id => ({
          url: `/notification/${id}`,
          method: 'PATCH',
        }),
        invalidatesTags: ['Notification'],
      }),
    }),
  });
