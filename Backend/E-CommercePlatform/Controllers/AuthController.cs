using Common.DTOs;
using Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;

namespace E_CommercePlatform.Controllers
{
    /// <summary>
    /// Authentication controller for user login and registration
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Tags("Authentication")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthenticationService _authService;

        public AuthController(IAuthenticationService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token
        /// </summary>
        /// <param name="loginDto">User login credentials</param>
        /// <returns>JWT token for authenticated user</returns>
        /// <response code="200">Returns JWT token when login is successful</response>
        /// <response code="401">Returns error when credentials are invalid</response>
        /// <response code="400">Returns error when request data is invalid</response>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody][Required] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var token = await _authService.LoginAsync(loginDto);
            if (token == null)
                return Unauthorized("Invalid credentials");

            return Ok(new { token, message = "Login successful" });
        }

        /// <summary>
        /// Registers a new user account
        /// </summary>
        /// <param name="registerDto">User registration information</param>
        /// <returns>Success message when registration is completed</returns>
        /// <response code="200">Returns success message when registration is successful</response>
        /// <response code="400">Returns error when user already exists or data is invalid</response>
        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody][Required] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(registerDto);
            if (!result)
                return BadRequest("User already exists or registration failed");

            return Ok("User registered successfully");
        }
    }
}
