import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../redux/slices/authSlice';
import cartSlice from '../redux/slices/cartSlice';
import wishlistSlice from '../redux/slices/wishlistSlice';

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cart: cartSlice,
      wishlist: wishlistSlice,
    },
    preloadedState: {
      auth: { isAuthenticated: false, user: null },
      cart: { items: [], totalAmount: 0 },
      wishlist: { items: [] },
    },
  });
};

const TestWrapper = ({ children }) => (
  <Provider store={createTestStore()}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('Simple Component Tests', () => {
  test('Redux store initializes correctly', () => {
    const store = createTestStore();
    const state = store.getState();
    
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.cart.items).toEqual([]);
    expect(state.wishlist.items).toEqual([]);
  });

  test('Test wrapper renders without crashing', () => {
    render(
      <TestWrapper>
        <div>Test Content</div>
      </TestWrapper>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});