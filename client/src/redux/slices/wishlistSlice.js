import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/wishlist');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post('/wishlist/toggle', { productId });
    toast.success(res.data.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
    return { productId, action: res.data.action };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { productIds: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.productIds = (action.payload?.products || []).map((p) => p._id || p);
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, action: act } = action.payload;
        if (act === 'added') {
          if (!state.productIds.includes(productId)) state.productIds.push(productId);
        } else {
          state.productIds = state.productIds.filter((id) => id !== productId);
        }
      });
  },
});

export default wishlistSlice.reducer;
