import { apiSlice } from 'features/api/api-slice';
import { Folder } from 'utils/type';

export const {
  useReadFoldersQuery,
  useLazyReadFolderQuery,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useCreateFolderMutation,
  useShareFolderMutation,
} = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    readFolders: builder.query<Folder[], void>({
      query: () => '/folder',
      providesTags: ['Folder'],
    }),
    readFolder: builder.query<Folder, number>({
      query: id => `/folder/${id}`,
      providesTags: ['Folder'],
    }),
    updateFolder: builder.mutation<
      Folder,
      {
        id: number;
        body: Partial<Folder>;
      }
    >({
      query: ({ id, body }) => ({
        url: `/folder/${id}`,
        body,
        method: 'PATCH',
      }),
      invalidatesTags: ['Folder'],
    }),

    shareFolder: builder.mutation<
      void,
      { id: string | number; body: { contacts: string[] } }
    >({
      query: ({ id, body }) => ({
        url: `/folder/${id}/share`,
        body,
        method: 'POST',
      }),
      invalidatesTags: ['Folder'],
    }),
    deleteFolder: builder.mutation<void, number>({
      query: id => ({
        url: `/folder/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Folder'],
    }),
    createFolder: builder.mutation<Folder, Partial<Folder>>({
      query: body => ({
        url: '/folder',
        body,
        method: 'POST',
      }),
      invalidatesTags: ['Folder'],
    }),
  }),
});
