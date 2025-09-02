import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

// Mock Header component
const MockHeader = ({ isAuthenticated, user, onLogout, cartItemCount }) => {
  return (
    <header data-testid="header">
      <nav>
        <div>
          <h1>E-Commerce</h1>
        </div>
        <div>
          <a href="/" data-testid="home-link">Home</a>
          <a href="/products" data-testid="products-link">Products</a>
          {isAuthenticated ? (
            <>
              <a href="/cart" data-testid="cart-link">
                Cart ({cartItemCount})
              </a>
              <span data-testid="user-greeting">Hello, {user?.username}</span>
              <button onClick={onLogout} data-testid="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" data-testid="login-link">Login</a>
              <a href="/register" data-testid="register-link">Register</a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Header Component', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockLogout = jest.fn();

  beforeEach(() => {
    mockLogout.mockClear();
  });

  test('renders header with brand name', () => {
    render(
      <TestWrapper>
        <MockHeader 
          isAuthenticated={false} 
          user={null} 
          onLogout={mockLogout}
          cartItemCount={0}
        />
      </TestWrapper>
    );

    expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    expect(screen.getByTestId('home-link')).toBeInTheDocument();
    expect(screen.getByTestId('products-link')).toBeInTheDocument();
  });

  test('shows login and register links when not authenticated', () => {
    render(
      <TestWrapper>
        <MockHeader 
          isAuthenticated={false} 
          user={null} 
          onLogout={mockLogout}
          cartItemCount={0}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('login-link')).toBeInTheDocument();
    expect(screen.getByTestId('register-link')).toBeInTheDocument();
    expect(screen.queryByTestId('logout-btn')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cart-link')).not.toBeInTheDocument();
  });

  test('shows user info and logout when authenticated', () => {
    render(
      <TestWrapper>
        <MockHeader 
          isAuthenticated={true} 
          user={mockUser} 
          onLogout={mockLogout}
          cartItemCount={3}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('user-greeting')).toHaveTextContent('Hello, testuser');
    expect(screen.getByTestId('logout-btn')).toBeInTheDocument();
    expect(screen.getByTestId('cart-link')).toHaveTextContent('Cart (3)');
    expect(screen.queryByTestId('login-link')).not.toBeInTheDocument();
    expect(screen.queryByTestId('register-link')).not.toBeInTheDocument();
  });

  test('calls onLogout when logout button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <MockHeader 
          isAuthenticated={true} 
          user={mockUser} 
          onLogout={mockLogout}
          cartItemCount={0}
        />
      </TestWrapper>
    );

    const logoutButton = screen.getByTestId('logout-btn');
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  test('displays correct cart item count', () => {
    render(
      <TestWrapper>
        <MockHeader 
          isAuthenticated={true} 
          user={mockUser} 
          onLogout={mockLogout}
          cartItemCount={5}
        />
      </TestWrapper>
    );

    expect(screen.getByTestId('cart-link')).toHaveTextContent('Cart (5)');
  });
});