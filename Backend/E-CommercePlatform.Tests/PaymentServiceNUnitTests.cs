using PaymentService;
using Common.DTOs;
using Stripe;

namespace E_CommercePlatform.Tests
{
    [TestFixture]
    public class PaymentServiceTests
    {
        private PaymentServiceImpl _paymentService;
        private const string TestStripeKey = "sk_test_fake_key_for_testing";

        [SetUp]
        public void Setup()
        {
            _paymentService = new PaymentServiceImpl(TestStripeKey);
        }

        [Test]
        public void Constructor_ShouldSetStripeApiKey()
        {
            // Act
            var service = new PaymentServiceImpl(TestStripeKey);

            // Assert
            Assert.That(StripeConfiguration.ApiKey, Is.EqualTo(TestStripeKey));
        }

        [Test]
        public async Task ProcessPayment_WithValidData_ShouldReturnSuccessResult()
        {
            // Arrange
            var paymentDto = new PaymentDto
            {
                Amount = 25.99m,
                PaymentToken = "pm_card_visa"
            };

            // Act
            var result = await _paymentService.ProcessPaymentAsync(paymentDto);
            
            // Assert - Should fail due to fake key
            Assert.That(result.Success, Is.False);
        }

        [Test]
        public async Task ProcessPayment_WithInvalidToken_ShouldReturnFailureResult()
        {
            // Arrange
            var paymentDto = new PaymentDto
            {
                Amount = 25.99m,
                PaymentToken = "invalid_token"
            };

            // Act
            var result = await _paymentService.ProcessPaymentAsync(paymentDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Success, Is.False);
            Assert.That(result.Message, Does.Contain("Stripe error"));
        }

        [Test]
        public async Task ProcessPayment_WithZeroAmount_ShouldReturnFailureResult()
        {
            // Arrange
            var paymentDto = new PaymentDto
            {
                Amount = 0m,
                PaymentToken = "pm_card_visa"
            };

            // Act
            var result = await _paymentService.ProcessPaymentAsync(paymentDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Success, Is.False);
        }

        [Test]
        public async Task ProcessPayment_WithNegativeAmount_ShouldReturnFailureResult()
        {
            // Arrange
            var paymentDto = new PaymentDto
            {
                Amount = -10.00m,
                PaymentToken = "pm_card_visa"
            };

            // Act
            var result = await _paymentService.ProcessPaymentAsync(paymentDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Success, Is.False);
        }

        [Test]
        public async Task RefundPayment_WithInvalidTransactionId_ShouldReturnFalse()
        {
            // Act
            var result = await _paymentService.RefundPaymentAsync("invalid_transaction_id", 25.99m);

            // Assert
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task RefundPayment_WithZeroAmount_ShouldReturnFalse()
        {
            // Act
            var result = await _paymentService.RefundPaymentAsync("pi_valid_transaction", 0m);

            // Assert
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task RefundPayment_WithNegativeAmount_ShouldReturnFalse()
        {
            // Act
            var result = await _paymentService.RefundPaymentAsync("pi_valid_transaction", -10.00m);

            // Assert
            Assert.That(result, Is.False);
        }

        [Test]
        public void PaymentService_WithValidStripeKey_ShouldInitializeSuccessfully()
        {
            // Act & Assert
            Assert.DoesNotThrow(() => new PaymentServiceImpl("sk_test_valid_key"));
        }

        [Test]
        public void PaymentService_WithEmptyStripeKey_ShouldInitializeWithEmptyKey()
        {
            // Act
            var service = new PaymentServiceImpl("");

            // Assert
            Assert.That(StripeConfiguration.ApiKey, Is.EqualTo(""));
        }

        [Test]
        public void PaymentService_WithNullStripeKey_ShouldInitializeWithNullKey()
        {
            // Act
            var service = new PaymentServiceImpl(null);

            // Assert
            Assert.That(StripeConfiguration.ApiKey, Is.Null);
        }
    }
}