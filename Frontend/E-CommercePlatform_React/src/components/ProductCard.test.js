import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import ProductCard from './ProductCard';
import authSlice from '../redux/slices/authSlice';
import cartSlice from '../redux/slices/cartSlice';
import wishlistSlice from '../redux/slices/wishlistSlice';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock cartService
jest.mock('../services/cartService', () => ({
  cartService: {
    addToCart: jest.fn(),
  },
}));



const createMockStore = (authState) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cart: cartSlice,
      wishlist: wishlistSlice,
    },
    preloadedState: {
      auth: authState,
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

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    stock: 10,
    imageUrl: 'test-image.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders product information correctly', () => {
    const store = createMockStore({ isAuthenticated: true });

    render(
      <TestWrapper store={store}>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/Test Description/)).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('10 left')).toBeInTheDocument();
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  test('shows Add to Cart button when product is in stock', () => {
    const store = createMockStore({ isAuthenticated: true });

    render(
      <TestWrapper store={store}>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add to Cart');
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeDisabled();
  });

  test('shows Out of Stock button when product stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    const store = createMockStore({ isAuthenticated: true });

    render(
      <TestWrapper store={store}>
        <ProductCard product={outOfStockProduct} />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /out of stock/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('navigates to product details when card is clicked', async () => {
    const user = userEvent.setup();
    const store = createMockStore({ isAuthenticated: true });

    render(
      <TestWrapper store={store}>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const productImage = screen.getByAltText('Test Product');
    await user.click(productImage);

    expect(mockNavigate).toHaveBeenCalledWith('/product/1');
  });

  test('adds item to cart when authenticated user clicks Add to Cart', async () => {
    const user = userEvent.setup();
    const store = createMockStore({ isAuthenticated: true });
    
    const { cartService } = require('../services/cartService');
    cartService.addToCart.mockResolvedValue({});

    render(
      <TestWrapper store={store}>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const addButton = screen.getByText(/Add.*to Cart/);
    await user.click(addButton);

    await waitFor(() => {
      expect(cartService.addToCart).toHaveBeenCalledWith(1, 1);
    }, { timeout: 3000 });
  });
});