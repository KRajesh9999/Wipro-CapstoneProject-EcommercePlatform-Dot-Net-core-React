import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Home from './Home';
import productSlice from '../redux/slices/productSlice';
import authSlice from '../redux/slices/authSlice';
import cartSlice from '../redux/slices/cartSlice';
import wishlistSlice from '../redux/slices/wishlistSlice';

// Mock productService
jest.mock('../services/productService', () => ({
  productService: {
    getAllProducts: jest.fn(),
  },
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      products: productSlice,
      auth: authSlice,
      cart: cartSlice,
      wishlist: wishlistSlice,
    },
    preloadedState: {
      products: {
        products: [
          {
            id: 1,
            name: 'Test Product',
            price: 29.99,
            category: 'Electronics',
            stock: 10
          }
        ],
        loading: false,
        error: null,
        filters: {
          category: '',
          priceRange: { min: 0, max: 10000 },
          searchTerm: '',
        }
      },
      auth: { isAuthenticated: false, user: null },
      cart: { items: [] },
      wishlist: { items: [] },
    },
  });
};

const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders hero section correctly', () => {
    const store = createMockStore();

    render(
      <TestWrapper store={store}>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('Welcome to ShopHub')).toBeInTheDocument();
    expect(screen.getByText(/Discover amazing products/)).toBeInTheDocument();
  });

  test('displays product statistics', () => {
    const store = createMockStore();

    render(
      <TestWrapper store={store}>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('1+')).toBeInTheDocument(); // Products count
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  test('renders search and filter section', () => {
    const store = createMockStore();

    render(
      <TestWrapper store={store}>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText(/Search by name/)).toBeInTheDocument();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  test('displays products when available', async () => {
    const store = createMockStore();

    render(
      <TestWrapper store={store}>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });
});