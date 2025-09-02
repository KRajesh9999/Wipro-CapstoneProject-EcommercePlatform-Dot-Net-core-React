using Microsoft.EntityFrameworkCore;
using Database.Context;
using Database.Models;
using CartService;
using Common.DTOs;

namespace E_CommercePlatform.Tests
{
    [TestFixture]
    public class CartServiceTests
    {
        private EcommerceDbContext _context;
        private CartServiceImpl _cartService;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<EcommerceDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb" + Guid.NewGuid())
                .Options;

            _context = new EcommerceDbContext(options);
            _cartService = new CartServiceImpl(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        [Test]
        public async Task GetCartByUserId_WithNewUser_ShouldCreateEmptyCart()
        {
            // Act
            var result = await _cartService.GetCartByUserIdAsync(1);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.UserId, Is.EqualTo(1));
            Assert.That(result.Items.Count, Is.EqualTo(0));
            Assert.That(result.TotalAmount, Is.EqualTo(0));

            var cartInDb = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == 1);
            Assert.That(cartInDb, Is.Not.Null);
        }

        [Test]
        public async Task GetCartByUserId_WithExistingCart_ShouldReturnCartWithItems()
        {
            // Arrange
            var product = new Product { Name = "Test Product", Description = "Test Description", Price = 10.99m, Stock = 5, Category = "Electronics", ImageUrl = "test.jpg" };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var cart = new Cart { UserId = 1 };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            var cartItem = new CartItem { CartId = cart.Id, ProductId = product.Id, Quantity = 2 };
            _context.CartItems.Add(cartItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _cartService.GetCartByUserIdAsync(1);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Items.Count, Is.EqualTo(1));
            Assert.That(result.Items.First().Quantity, Is.EqualTo(2));
            Assert.That(result.Items.First().ProductName, Is.EqualTo("Test Product"));
            Assert.That(result.TotalAmount, Is.EqualTo(21.98m));
        }

        [Test]
        public async Task AddToCart_WithNewProduct_ShouldAddProductToCart()
        {
            // Arrange
            var product = new Product { Name = "Test Product", Description = "Test Description", Price = 15.99m, Stock = 10, Category = "Electronics", ImageUrl = "test.jpg" };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var addToCartDto = new AddToCartDto { ProductId = product.Id, Quantity = 3 };

            // Act
            var result = await _cartService.AddToCartAsync(1, addToCartDto);

            // Assert
            Assert.That(result, Is.True);

            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.ProductId == product.Id);
            Assert.That(cartItem, Is.Not.Null);
            Assert.That(cartItem!.Quantity, Is.EqualTo(3));
        }

        [Test]
        public async Task UpdateCartItem_WithNonExistentCart_ShouldReturnFalse()
        {
            // Act
            var result = await _cartService.UpdateCartItemAsync(999, 1, 5);

            // Assert
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task RemoveFromCart_WithNonExistentItem_ShouldReturnFalse()
        {
            // Arrange
            var cart = new Cart { UserId = 1 };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            // Act
            var result = await _cartService.RemoveFromCartAsync(1, 999);

            // Assert
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task ClearCart_WithNonExistentCart_ShouldReturnFalse()
        {
            // Act
            var result = await _cartService.ClearCartAsync(999);

            // Assert
            Assert.That(result, Is.False);
        }
    }
}