import { authService } from './authService';
import api from './api';

// Mock the api module
jest.mock('./api', () => ({
  post: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should login successfully and store token', async () => {
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          user: { id: 1, email: 'test@example.com' }
        }
      };
      
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/Auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token');
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle login failure', async () => {
      const mockError = new Error('Invalid credentials');
      api.post.mockRejectedValue(mockError);

      await expect(authService.login('wrong@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
      
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    test('should register successfully', async () => {
      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: 1, username: 'testuser', email: 'test@example.com' }
        }
      };
      
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.register('testuser', 'test@example.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/Auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('logout', () => {
    test('should remove token from localStorage', () => {
      authService.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when token exists', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');

      const result = authService.isAuthenticated();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(result).toBe(true);
    });

    test('should return false when token does not exist', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(result).toBe(false);
    });
  });
});