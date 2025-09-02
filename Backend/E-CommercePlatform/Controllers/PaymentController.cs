using Common.DTOs;
using Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace E_CommercePlatform.Controllers
{
    /// <summary>
    /// Payment processing controller for Stripe integration
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    [Tags("Payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Process payment using Stripe
        /// </summary>
        /// <param name="paymentDto">Payment details including amount and payment method</param>
        /// <returns>Payment result with transaction ID</returns>
        /// <response code="200">Payment processed successfully</response>
        /// <response code="400">Payment failed or invalid data</response>
        /// <response code="401">Unauthorized access</response>
        [HttpPost("process")]
        [ProducesResponseType(typeof(PaymentResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(PaymentResultDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ProcessPayment([FromBody][Required] PaymentDto paymentDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _paymentService.ProcessPaymentAsync(paymentDto);
                
                if (result.Success)
                    return Ok(result);
                else
                    return BadRequest(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new PaymentResultDto
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        /// <summary>
        /// Process refund for a payment (Admin only)
        /// </summary>
        /// <param name="refundDto">Refund details including transaction ID and amount</param>
        /// <returns>Refund result</returns>
        /// <response code="200">Refund processed successfully</response>
        /// <response code="400">Refund failed</response>
        /// <response code="401">Unauthorized access</response>
        /// <response code="403">Forbidden - Admin role required</response>
        [HttpPost("refund")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RefundPayment([FromBody][Required] RefundDto refundDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _paymentService.RefundPaymentAsync(refundDto.TransactionId, refundDto.Amount);
                
                if (result)
                    return Ok("Refund processed successfully");
                else
                    return BadRequest("Refund failed");
            }
            catch (Exception ex)
            {
                return BadRequest($"Refund failed: {ex.Message}");
            }
        }
    }

    public class RefundDto
    {
        public string TransactionId { get; set; }
        public decimal Amount { get; set; }
    }
}