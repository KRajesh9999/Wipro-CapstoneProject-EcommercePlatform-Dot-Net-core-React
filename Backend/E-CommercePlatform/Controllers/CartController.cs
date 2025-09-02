using Common.DTOs;
using Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace E_CommercePlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetCurrentUserId();
            var cart = await _cartService.GetCartByUserIdAsync(userId);
            return Ok(cart);
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto addToCartDto)
        {
            try
            {
                Console.WriteLine($"DEBUG: User authenticated: {User.Identity.IsAuthenticated}");
                Console.WriteLine($"DEBUG: User claims count: {User.Claims.Count()}");
                
                foreach (var claim in User.Claims)
                {
                    Console.WriteLine($"DEBUG: Claim - {claim.Type}: {claim.Value}");
                }
                
                var userId = GetCurrentUserId();
                Console.WriteLine($"DEBUG: User ID: {userId}");
                
                var result = await _cartService.AddToCartAsync(userId, addToCartDto);
                
                if (!result)
                    return BadRequest("Failed to add item to cart");

                return Ok("Item added to cart successfully");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DEBUG: Error in AddToCart: {ex.Message}");
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPut("update/{productId}")]
        public async Task<IActionResult> UpdateCartItem(int productId, [FromBody] int quantity)
        {
            var userId = GetCurrentUserId();
            var result = await _cartService.UpdateCartItemAsync(userId, productId, quantity);
            
            if (!result)
                return NotFound("Cart item not found");

            return Ok("Cart item updated successfully");
        }

        [HttpDelete("remove/{productId}")]
        public async Task<IActionResult> RemoveFromCart(int productId)
        {
            var userId = GetCurrentUserId();
            var result = await _cartService.RemoveFromCartAsync(userId, productId);
            
            if (!result)
                return NotFound("Cart item not found");

            return Ok("Item removed from cart successfully");
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();
            var result = await _cartService.ClearCartAsync(userId);
            
            if (!result)
                return NotFound("Cart not found");

            return Ok("Cart cleared successfully");
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim);
        }
    }
}
