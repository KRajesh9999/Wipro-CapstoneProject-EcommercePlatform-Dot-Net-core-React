import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Cart from './Cart';
import cartSlice from '../redux/slices/cartSlice';
import authSlice from '../redux/slices/authSlice';

// Mock cartService
jest.mock('../services/cartService', () => ({
  cartService: {
    getCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeFromCart: jest.fn(),
  },
}));

const createMockStore = (cartItems = []) => {
  return configureStore({
    reducer: {
      cart: cartSlice,
      auth: authSlice,
    },
    preloadedState: {
      cart: {
        items: cartItems,
        totalAmount: cartItems.reduce((sum, item) => sum + item.subtotal, 0),
        loading: false,
        error: null,
      },
      auth: {
        isAuthenticated: true,
        user: { id: 1, username: 'testuser' }
      }
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

describe('Cart Component', () => {
  const mockCartItems = [
    {
      productId: 1,
      productName: 'Test Product',
      price: 29.99,
      quantity: 2,
      subtotal: 59.98,
      imageUrl: 'test-image.jpg'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty cart message when no items', () => {
    const store = createMockStore([]);

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Start Shopping')).toBeInTheDocument();
  });

  test('displays cart items correctly', () => {
    const store = createMockStore(mockCartItems);

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99 each')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('calculates total amount correctly', () => {
    const store = createMockStore(mockCartItems);

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    expect(screen.getAllByText('$59.98')[0]).toBeInTheDocument();
  });

  test('updates quantity when + button clicked', async () => {
    const user = userEvent.setup();
    const store = createMockStore(mockCartItems);
    
    const { cartService } = require('../services/cartService');
    cartService.updateCartItem.mockResolvedValue({});

    render(
      <TestWrapper store={store}>
        <Cart />
      </TestWrapper>
    );

    const increaseButton = screen.getByRole('button', { name: '' }).parentElement.querySelector('.fa-plus').parentElement;
    await user.click(increaseButton);

    await waitFor(() => {
      expect(cartService.updateCartItem).toHaveBeenCalledWith(1, 3);
    });
  });
});