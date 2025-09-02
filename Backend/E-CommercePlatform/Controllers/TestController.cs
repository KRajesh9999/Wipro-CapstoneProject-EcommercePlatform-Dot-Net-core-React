using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace E_CommercePlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet("public")]
        public IActionResult PublicEndpoint()
        {
            return Ok(new { message = "Public endpoint works", timestamp = DateTime.UtcNow });
        }

        [HttpGet("protected")]
        [Authorize]
        public IActionResult ProtectedEndpoint()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            
            return Ok(new { 
                message = "Protected endpoint works", 
                userId = userId,
                email = email,
                timestamp = DateTime.UtcNow 
            });
        }

        [HttpGet("token-info")]
        [Authorize]
        public IActionResult TokenInfo()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(new { 
                message = "Token is valid",
                claims = claims,
                isAuthenticated = User.Identity.IsAuthenticated
            });
        }
    }
}