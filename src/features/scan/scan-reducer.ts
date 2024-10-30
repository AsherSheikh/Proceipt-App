import { createSlice } from '@reduxjs/toolkit';
import { pipe, prop } from 'ramda';
import { RootState } from 'redux/root-reducer';

const slice = 'scan';

type InitialState = {
  showPreview: boolean;
  images: { uri: string; type: 'PDF' | 'IMG' }[];
};

const initialState: InitialState = {
  showPreview: false,
  images: [],
};

export const {
  reducer,
  actions: { setImages, setShowPreview },
} = createSlice({
  name: slice,
  initialState,
  reducers: {
    setImages: (state, { payload }) => {
      state.images = payload;
    },
    setShowPreview: (state, { payload }) => {
      state.showPreview = payload;
    },
  },
});

const getScanSlice = (state: RootState) => state[slice];

const getImages = pipe(getScanSlice, prop('images'));
const getShowPreview = pipe(getScanSlice, prop('showPreview'));

export { slice, getImages, getShowPreview };
