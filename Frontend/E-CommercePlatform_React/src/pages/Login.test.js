import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import authSlice from '../redux/slices/authSlice';

// Mock services
jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock alert
global.alert = jest.fn();

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: { isAuthenticated: false, user: null, error: null },
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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    const store = createMockStore();

    render(
      <TestWrapper store={store}>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account? Register")).toBeInTheDocument();
  });

  test('allows user to type in email and password fields', async () => {
    const user = userEvent.setup();
    const store = createMockStore();

    render(
      <TestWrapper store={store}>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('shows loading state when form is submitted', async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    
    const { authService } = require('../services/authService');
    authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <TestWrapper store={store}>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('calls authService.login with correct credentials', async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    
    const { authService } = require('../services/authService');
    authService.login.mockResolvedValue({ token: 'mock-token' });

    render(
      <TestWrapper store={store}>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('shows success message and navigates on successful login', async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    
    const { authService } = require('../services/authService');
    authService.login.mockResolvedValue({ token: 'mock-token' });

    render(
      <TestWrapper store={store}>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Login successful!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows error message on login failure', async () => {
    const user = userEvent.setup();
    const store = createMockStore();
    
    const { authService } = require('../services/authService');
    authService.login.mockRejectedValue({
      response: { data: 'Invalid credentials' }
    });

    render(
      <TestWrapper store={store}>
        <Login />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Login failed: Invalid credentials');
    });
  });

  test('form validation prevents submission with empty fields', async () => {
    const user = userEvent.setup();
    const store = createMockStore();

    render(
      <TestWrapper store={store}>
        <Login />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeRequired();
    
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeRequired();
  });
});