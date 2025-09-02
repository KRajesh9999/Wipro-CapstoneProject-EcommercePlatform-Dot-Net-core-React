namespace Common.DTOs
{
    public class PaymentDto
    {
        public string PaymentMethod { get; set; } // "Stripe", "PayPal", "CreditCard"
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentToken { get; set; } // From frontend payment form
    }

    public class PaymentResultDto
    {
        public bool Success { get; set; }
        public string TransactionId { get; set; }
        public string Message { get; set; }
    }
}
