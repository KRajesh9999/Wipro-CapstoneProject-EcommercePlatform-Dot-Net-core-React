import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock ProductCard component
const MockProductCard = ({ product, onAddToCart }) => {
  return (
    <div data-testid="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <span data-testid="price">${product.price}</span>
      <button 
        onClick={() => onAddToCart(product.id)}
        data-testid="add-to-cart"
      >
        Add to Cart
      </button>
    </div>
  );
};

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    image: 'test-image.jpg'
  };

  const mockAddToCart = jest.fn();

  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  test('renders product information correctly', () => {
    render(<MockProductCard product={mockProduct} onAddToCart={mockAddToCart} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByTestId('price')).toHaveTextContent('$29.99');
    expect(screen.getByAltText('Test Product')).toBeInTheDocument();
  });

  test('calls onAddToCart when Add to Cart button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<MockProductCard product={mockProduct} onAddToCart={mockAddToCart} />);

    const addButton = screen.getByTestId('add-to-cart');
    await user.click(addButton);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(1);
  });

  test('displays product image with correct src and alt', () => {
    render(<MockProductCard product={mockProduct} onAddToCart={mockAddToCart} />);

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });
});