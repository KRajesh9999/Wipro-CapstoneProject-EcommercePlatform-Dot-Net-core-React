import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock Cart component
const MockCart = ({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div>
      <h1>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <p data-testid="empty-cart">Your cart is empty</p>
      ) : (
        <>
          <div data-testid="cart-items">
            {cartItems.map(item => (
              <div key={item.id} data-testid={`cart-item-${item.id}`}>
                <span>{item.name}</span>
                <span>${item.price}</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
                  data-testid={`quantity-${item.id}`}
                />
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  data-testid={`remove-${item.id}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div data-testid="cart-total">Total: ${total.toFixed(2)}</div>
          <button onClick={onClearCart} data-testid="clear-cart">
            Clear Cart
          </button>
          <button data-testid="checkout">Checkout</button>
        </>
      )}
    </div>
  );
};

// Mock store
const createMockStore = (cartItems = []) => {
  return configureStore({
    reducer: {
      cart: (state = { items: cartItems }, action) => state
    }
  });
};

describe('Cart Component', () => {
  const mockCartItems = [
    { id: 1, name: 'Product 1', price: 10.99, quantity: 2 },
    { id: 2, name: 'Product 2', price: 15.50, quantity: 1 }
  ];

  const mockHandlers = {
    onUpdateQuantity: jest.fn(),
    onRemoveItem: jest.fn(),
    onClearCart: jest.fn()
  };

  beforeEach(() => {
    Object.values(mockHandlers).forEach(mock => mock.mockClear());
  });

  test('displays empty cart message when no items', () => {
    render(<MockCart cartItems={[]} {...mockHandlers} />);

    expect(screen.getByTestId('empty-cart')).toHaveTextContent('Your cart is empty');
    expect(screen.queryByTestId('cart-items')).not.toBeInTheDocument();
  });

  test('displays cart items when items exist', () => {
    render(<MockCart cartItems={mockCartItems} {...mockHandlers} />);

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
  });

  test('calculates and displays correct total', () => {
    render(<MockCart cartItems={mockCartItems} {...mockHandlers} />);

    // (10.99 * 2) + (15.50 * 1) = 37.48
    expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $37.48');
  });

  test('calls onUpdateQuantity when quantity is changed', async () => {
    const user = userEvent.setup();
    
    render(<MockCart cartItems={mockCartItems} {...mockHandlers} />);

    const quantityInput = screen.getByTestId('quantity-1');
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');

    expect(mockHandlers.onUpdateQuantity).toHaveBeenCalledWith(1, 3);
  });

  test('calls onRemoveItem when remove button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<MockCart cartItems={mockCartItems} {...mockHandlers} />);

    const removeButton = screen.getByTestId('remove-1');
    await user.click(removeButton);

    expect(mockHandlers.onRemoveItem).toHaveBeenCalledWith(1);
  });

  test('calls onClearCart when clear cart button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<MockCart cartItems={mockCartItems} {...mockHandlers} />);

    const clearButton = screen.getByTestId('clear-cart');
    await user.click(clearButton);

    expect(mockHandlers.onClearCart).toHaveBeenCalledTimes(1);
  });
});