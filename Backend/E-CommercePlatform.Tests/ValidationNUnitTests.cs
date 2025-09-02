using Common.DTOs;
using System.ComponentModel.DataAnnotations;

namespace E_CommercePlatform.Tests
{
    [TestFixture]
    public class ValidationTests
    {
        [Test]
        public void RegisterDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var registerDto = new RegisterDto
            {
                Username = "validuser",
                Email = "valid@example.com",
                Password = "ValidPassword123!"
            };

            // Act
            var validationResults = ValidateModel(registerDto);

            // Assert
            Assert.That(validationResults.Count, Is.EqualTo(0));
        }

        [Test]
        public void LoginDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "valid@example.com",
                Password = "ValidPassword123!"
            };

            // Act
            var validationResults = ValidateModel(loginDto);

            // Assert
            Assert.That(validationResults.Count, Is.EqualTo(0));
        }

        [Test]
        public void ProductDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var productDto = new ProductDto
            {
                Name = "Valid Product",
                Description = "Valid Description",
                Price = 29.99m,
                Stock = 10,
                Category = "Electronics"
            };

            // Act
            var validationResults = ValidateModel(productDto);

            // Assert
            Assert.That(validationResults.Count, Is.EqualTo(0));
        }

        [Test]
        public void AddToCartDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var addToCartDto = new AddToCartDto
            {
                ProductId = 1,
                Quantity = 2
            };

            // Act
            var validationResults = ValidateModel(addToCartDto);

            // Assert
            Assert.That(validationResults.Count, Is.EqualTo(0));
        }

        [Test]
        public void PaymentDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var paymentDto = new PaymentDto
            {
                Amount = 99.99m,
                PaymentToken = "pm_card_visa"
            };

            // Act
            var validationResults = ValidateModel(paymentDto);

            // Assert
            Assert.That(validationResults.Count, Is.EqualTo(0));
        }

        private List<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(model);
            Validator.TryValidateObject(model, validationContext, validationResults, true);
            return validationResults;
        }
    }
}