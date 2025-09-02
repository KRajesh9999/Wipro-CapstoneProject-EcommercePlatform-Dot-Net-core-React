import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalAmount: 0,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalAmount = action.payload.totalAmount || 0;
      state.loading = false;
      state.error = null;
    },
    addToCartLocal: (state, action) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.subtotal = existingItem.price * existingItem.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount = state.items.reduce((total, item) => total + item.subtotal, 0);
    },
    updateCartItemLocal: (state, action) => {
      const { productId, quantity } = action.payload;
      const existingItem = state.items.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity = quantity;
        existingItem.subtotal = existingItem.price * quantity;
      }
      state.totalAmount = state.items.reduce((total, item) => total + item.subtotal, 0);
    },
    removeFromCartLocal: (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      state.totalAmount = state.items.reduce((total, item) => total + item.subtotal, 0);
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setLoading, 
  setCart, 
  addToCartLocal, 
  updateCartItemLocal,
  removeFromCartLocal, 
  clearCartLocal, 
  setError 
} = cartSlice.actions;
export default cartSlice.reducer;