import { apiSlice } from 'features/api/api-slice';
import { Receipt } from 'utils/type';

export const {
  useReadReceiptQuery,
  useUpdateReceiptMutation,
  useShareReceiptMutation,
  useDeleteReceiptMutation,
  useScanReceiptMutation,
  useRemoveFromFolderMutation,
  useMoveIntoFolderMutation,
  useReadReceiptHistoryQuery,
  useLazyReadReceiptQuery,
  useReadReceiptsQuery,
} = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    readReceipts: builder.query<Receipt[], void>({
      query: () => '/receipt',
      providesTags: ['Receipt'],
    }),
    readReceipt: builder.query<Receipt, number>({
      query: (id: number) => `/receipt/${id}`,
      providesTags: ['Receipt'],
    }),
    readReceiptHistory: builder.query<any, void>({
      query: () => '/receipt/history',
      providesTags: ['Receipt'],
    }),

    updateReceipt: builder.mutation<
      Receipt,
      { id: number; body: Partial<Receipt> }
    >({
      query: ({ id, body }) => ({
        url: `/receipt/${id}`,
        body,
        method: 'PATCH',
      }),
      invalidatesTags: ['Receipt'],
    }),

    shareReceipt: builder.mutation<
      void,
      { id: number; body: { contacts: string[] } }
    >({
      query: ({ id, body }) => ({
        url: `/receipt/${id}/share`,
        body,
        method: 'POST',
      }),
      invalidatesTags: ['Receipt'],
    }),
    deleteReceipt: builder.mutation<void, number>({
      query: id => ({
        url: `/receipt/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Receipt'],
    }),
    scanReceipt: builder.mutation<
      Receipt,
      { receipts: string[]; folderId?: string }
    >({
      query: body => ({
        url: '/receipt/scan',
        body,
        method: 'POST',
      }),
      invalidatesTags: ['Receipt'],
    }),

    moveIntoFolder: builder.mutation<Receipt, { id: number; folder: number }>({
      query: ({ folder, id }) => ({
        url: `/receipt/${id}/folder`,
        body: {
          folder,
        },
        method: 'POST',
      }),
      invalidatesTags: ['Receipt', 'Folder'],
    }),

    removeFromFolder: builder.mutation<Receipt, { id: string; folder: string }>(
      {
        query: ({ folder, id }) => ({
          url: `/receipt/${id}/folder`,
          body: {
            folder,
          },
          method: 'DELETE',
        }),
        invalidatesTags: ['Receipt'],
      },
    ),
  }),
});
