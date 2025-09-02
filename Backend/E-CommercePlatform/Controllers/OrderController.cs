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
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto createOrderDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var order = await _orderService.CreateOrderAsync(userId, createOrderDto);
                return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserOrders()
        {
            var userId = GetCurrentUserId();
            var orders = await _orderService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var userId = GetCurrentUserId();
            var order = await _orderService.GetOrderByIdAsync(id, userId);

            if (order == null)
                return NotFound();

            return Ok(order);
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
        {
            var result = await _orderService.UpdateOrderStatusAsync(id, status);

            if (!result)
                return NotFound();

            return Ok("Order status updated successfully");
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim);
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            // Get current user ID from JWT token
            var userId = GetCurrentUserId();

            // Get the order with userId parameter
            var order = await _orderService.GetOrderByIdAsync(id, userId);

            if (order == null)
                return NotFound();

            // Check if order can be cancelled
            if (order.Status != "Pending" && order.Status != "Processing")
                return BadRequest("Order cannot be cancelled");

            // Cancel the order using correct method name
            await _orderService.UpdateOrderStatusAsync(id, "Cancelled");

            return Ok(new { message = "Order cancelled successfully" });
        }



    }
}
