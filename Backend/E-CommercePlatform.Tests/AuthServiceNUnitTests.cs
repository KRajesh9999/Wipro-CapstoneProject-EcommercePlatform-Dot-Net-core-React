using Microsoft.EntityFrameworkCore;
using Database.Context;
using Database.Models;
using AuthenticationService;
using Common.DTOs;

namespace E_CommercePlatform.Tests
{
    [TestFixture]
    public class AuthServiceTests
    {
        private EcommerceDbContext _context;
        private AuthService _authService;
        private const string TestJwtSecret = "ThisIsATestSecretKeyForJWTTokenGenerationThatIsLongEnough";

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<EcommerceDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb" + Guid.NewGuid())
                .Options;

            _context = new EcommerceDbContext(options);
            _authService = new AuthService(_context, TestJwtSecret);
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        [Test]
        public async Task RegisterUser_WithValidData_ShouldReturnTrue()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.RegisterAsync(registerDto);

            // Assert
            Assert.That(result, Is.True);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            Assert.That(user, Is.Not.Null);
            Assert.That(user.Username, Is.EqualTo("testuser"));
            Assert.That(user.Email, Is.EqualTo("test@example.com"));
            Assert.That(BCrypt.Net.BCrypt.Verify("Password123!", user.PasswordHash), Is.True);
        }

        [Test]
        public async Task RegisterUser_WithDuplicateEmail_ShouldReturnFalse()
        {
            // Arrange
            var existingUser = new User
            {
                Username = "existing",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password")
            };

            _context.Users.Add(existingUser);
            await _context.SaveChangesAsync();

            var registerDto = new RegisterDto
            {
                Username = "newuser",
                Email = "test@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.RegisterAsync(registerDto);

            // Assert
            Assert.That(result, Is.False);

            var userCount = await _context.Users.CountAsync(u => u.Email == "test@example.com");
            Assert.That(userCount, Is.EqualTo(1));
        }

        [Test]
        public async Task LoginUser_WithValidCredentials_ShouldReturnToken()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Not.Empty);
            Assert.That(result.Split('.').Length, Is.EqualTo(3)); // JWT has 3 parts
        }

        [Test]
        public async Task LoginUser_WithInvalidEmail_ShouldReturnNull()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task LoginUser_WithInvalidPassword_ShouldReturnNull()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword123!"),
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "WrongPassword123!"
            };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task RegisterUser_ShouldHashPassword()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "PlainTextPassword123!"
            };

            // Act
            await _authService.RegisterAsync(registerDto);

            // Assert
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            Assert.That(user.PasswordHash, Is.Not.EqualTo("PlainTextPassword123!"));
            Assert.That(user.PasswordHash, Does.StartWith("$2"));
            Assert.That(BCrypt.Net.BCrypt.Verify("PlainTextPassword123!", user.PasswordHash), Is.True);
        }

        [Test]
        public async Task LoginUser_WithEmptyEmail_ShouldReturnNull()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "",
                Password = "Password123!"
            };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task LoginUser_WithEmptyPassword_ShouldReturnNull()
        {
            // Arrange
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                Role = "User"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = ""
            };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.That(result, Is.Null);
        }
    }
}