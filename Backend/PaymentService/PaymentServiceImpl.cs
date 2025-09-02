using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Stripe;
using Common.DTOs;
using Common.Interfaces;

namespace PaymentService
{
    public class PaymentServiceImpl : IPaymentService
    {
        private readonly string _stripeSecretKey;

        public PaymentServiceImpl(string stripeSecretKey)
        {
            _stripeSecretKey = stripeSecretKey;
            StripeConfiguration.ApiKey = _stripeSecretKey;
        }

        public async Task<PaymentResultDto> ProcessPaymentAsync(PaymentDto paymentDto)
        {
            try
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(paymentDto.Amount * 100), // Convert to cents
                    Currency = "usd",
                    PaymentMethod = paymentDto.PaymentToken,
                    ConfirmationMethod = "manual",
                    Confirm = true,
                    ReturnUrl = "https://your-website.com/return",
                };

                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);

                if (paymentIntent.Status == "succeeded")
                {
                    return new PaymentResultDto
                    {
                        Success = true,
                        TransactionId = paymentIntent.Id,
                        Message = "Payment processed successfully"
                    };
                }
                else
                {
                    return new PaymentResultDto
                    {
                        Success = false,
                        TransactionId = paymentIntent.Id,
                        Message = $"Payment requires additional action: {paymentIntent.Status}"
                    };
                }
            }
            catch (StripeException ex)
            {
                return new PaymentResultDto
                {
                    Success = false,
                    TransactionId = null,
                    Message = $"Stripe error: {ex.Message}"
                };
            }
            catch (Exception ex)
            {
                return new PaymentResultDto
                {
                    Success = false,
                    TransactionId = null,
                    Message = $"Payment failed: {ex.Message}"
                };
            }
        }

        public async Task<bool> RefundPaymentAsync(string transactionId, decimal amount)
        {
            try
            {
                var options = new RefundCreateOptions
                {
                    PaymentIntent = transactionId,
                    Amount = (long)(amount * 100), // Convert to cents
                };

                var service = new RefundService();
                var refund = await service.CreateAsync(options);

                return refund.Status == "succeeded";
            }
            catch (StripeException)
            {
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
