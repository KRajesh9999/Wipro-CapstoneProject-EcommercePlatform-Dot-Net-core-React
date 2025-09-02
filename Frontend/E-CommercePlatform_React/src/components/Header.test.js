import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import authSlice from '../redux/slices/authSlice';
import cartSlice from '../redux/slices/cartSlice';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const createMockStore = (authState, cartState) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cart: cartSlice,
    },
    preloadedState: {
      auth: authState,
      cart: cartState,
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

describe('Header Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders brand name and home link', () => {
    const store = createMockStore(
      { isAuthenticated: false, user: null },
      { items: [] }
    );

    render(
      <TestWrapper store={store}>
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    expect(screen.getByText('🏠 Home')).toBeInTheDocument();
  });

  test('shows login and register links when not authenticated', () => {
    const store = createMockStore(
      { isAuthenticated: false, user: null },
      { items: [] }
    );

    render(
      <TestWrapper store={store}>
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('🔑 Login')).toBeInTheDocument();
    expect(screen.getByText('📝 Register')).toBeInTheDocument();
    expect(screen.queryByText('🚪 Logout')).not.toBeInTheDocument();
  });

  test('shows user info and logout when authenticated', () => {
    const store = createMockStore(
      { 
        isAuthenticated: true, 
        user: { username: 'testuser', email: 'test@example.com' } 
      },
      { items: [{ quantity: 2 }, { quantity: 3 }] }
    );

    render(
      <TestWrapper store={store}>
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('👤 Hello, testuser')).toBeInTheDocument();
    expect(screen.getByText('🚪 Logout')).toBeInTheDocument();
    expect(screen.getByText('🛒 Cart (5)')).toBeInTheDocument();
    expect(screen.getByText('📦 Orders')).toBeInTheDocument();
    expect(screen.getByText('🛠️ Admin')).toBeInTheDocument();
  });

  test('displays correct cart item count', () => {
    const store = createMockStore(
      { isAuthenticated: true, user: { username: 'testuser' } },
      { items: [{ quantity: 1 }, { quantity: 4 }, { quantity: 2 }] }
    );

    render(
      <TestWrapper store={store}>
        <Header />
      </TestWrapper>
    );

    expect(screen.getByText('🛒 Cart (7)')).toBeInTheDocument();
  });

  test('calls logout and navigates when logout button is clicked', async () => {
    const user = userEvent.setup();
    const store = createMockStore(
      { isAuthenticated: true, user: { username: 'testuser' } },
      { items: [] }
    );

    render(
      <TestWrapper store={store}>
        <Header />
      </TestWrapper>
    );

    const logoutButton = screen.getByText('🚪 Logout');
    await user.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});