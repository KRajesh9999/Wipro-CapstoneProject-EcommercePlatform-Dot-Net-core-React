using Common.DTOs;
using Common.Interfaces;
using Database.Context;
using Database.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuthenticationService
{
    public class AuthService : IAuthenticationService
    {
        private readonly EcommerceDbContext _context;
        private readonly string _jwtSecret;

        public AuthService(EcommerceDbContext context, string jwtSecret)
        {
            _context = context;
            _jwtSecret = jwtSecret;
        }

        public async Task<string> LoginAsync(LoginDto loginDto)
        {
            Console.WriteLine($"=== LOGIN DEBUG ===");
            Console.WriteLine($"Email: {loginDto.Email}");
            Console.WriteLine($"Password: {loginDto.Password}");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                Console.WriteLine("ERROR: User not found in database");
                return null;
            }

            Console.WriteLine($"User found: {user.Username}");
            Console.WriteLine($"Stored hash: {user.PasswordHash}");

            bool isValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
            Console.WriteLine($"Password verification: {isValid}");

            if (!isValid)
            {
                Console.WriteLine("ERROR: Password verification failed");
                return null;
            }

            Console.WriteLine("SUCCESS: Generating token");
            return GenerateJwtToken(user);
        }


        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                return false;

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);

        }
    }
}
