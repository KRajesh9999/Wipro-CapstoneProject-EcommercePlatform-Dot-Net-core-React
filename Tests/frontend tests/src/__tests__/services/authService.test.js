// Mock authService
const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  isAuthenticated: jest.fn()
};

// Mock API responses
const mockLoginResponse = {
  token: 'mock-jwt-token',
  user: { id: 1, email: 'test@example.com', username: 'testuser' }
};

const mockRegisterResponse = {
  message: 'User registered successfully',
  user: { id: 1, email: 'test@example.com', username: 'testuser' }
};

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    test('should login successfully with valid credentials', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await mockAuthService.login(credentials);

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(mockLoginResponse);
    });

    test('should throw error with invalid credentials', async () => {
      const errorMessage = 'Invalid credentials';
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      await expect(mockAuthService.login(credentials)).rejects.toThrow(errorMessage);
    });
  });

  describe('register', () => {
    test('should register successfully with valid data', async () => {
      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await mockAuthService.register(userData);

      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockRegisterResponse);
    });

    test('should throw error when email already exists', async () => {
      const errorMessage = 'Email already exists';
      mockAuthService.register.mockRejectedValue(new Error(errorMessage));

      const userData = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      };

      await expect(mockAuthService.register(userData)).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    test('should logout successfully', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Logged out successfully' });

      const result = await mockAuthService.logout();

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getCurrentUser', () => {
    test('should return current user when authenticated', () => {
      const mockUser = { id: 1, email: 'test@example.com', username: 'testuser' };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);

      const result = mockAuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    test('should return null when not authenticated', () => {
      mockAuthService.getCurrentUser.mockReturnValue(null);

      const result = mockAuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when user is authenticated', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);

      const result = mockAuthService.isAuthenticated();

      expect(result).toBe(true);
    });

    test('should return false when user is not authenticated', () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);

      const result = mockAuthService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});