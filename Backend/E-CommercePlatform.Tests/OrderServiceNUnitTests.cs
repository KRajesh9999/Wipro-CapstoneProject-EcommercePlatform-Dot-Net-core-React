using Microsoft.EntityFrameworkCore;
using Database.Context;
using Database.Models;
using OrderService;
using Common.DTOs;

namespace E_CommercePlatform.Tests
{
    [TestFixture]
    public class OrderServiceTests
    {
        private EcommerceDbContext _context;
        private OrderServiceImpl _orderService;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<EcommerceDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb" + Guid.NewGuid())
                .Options;

            _context = new EcommerceDbContext(options);
            _orderService = new OrderServiceImpl(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        [Test]
        public async Task CreateOrder_WithValidData_ShouldCreateOrderSuccessfully()
        {
            // Arrange
            var product = new Product 
            { 
                Name = "Test Product", 
                Description = "Test Description",
                Price = 25.99m, 
                Stock = 10, 
                Category = "Electronics",
                ImageUrl = "test.jpg"
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var createOrderDto = new CreateOrderDto
            {
                ShippingAddress = "123 Test Street",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { ProductId = product.Id, Quantity = 2 }
                }
            };

            // Act
            var result = await _orderService.CreateOrderAsync(1, createOrderDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.UserId, Is.EqualTo(1));
            Assert.That(result.TotalAmount, Is.EqualTo(51.98m)); // 25.99 * 2
            Assert.That(result.Status, Is.EqualTo("Pending"));
            Assert.That(result.ShippingAddress, Is.EqualTo("123 Test Street"));
            Assert.That(result.OrderItems.Count, Is.EqualTo(1));

            // Verify stock was reduced
            var updatedProduct = await _context.Products.FindAsync(product.Id);
            Assert.That(updatedProduct!.Stock, Is.EqualTo(8)); // 10 - 2
        }

        [Test]
        public async Task CreateOrder_WithInsufficientStock_ShouldThrowException()
        {
            // Arrange
            var product = new Product 
            { 
                Name = "Test Product", 
                Description = "Test Description",
                Price = 25.99m, 
                Stock = 1, 
                Category = "Electronics",
                ImageUrl = "test.jpg"
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var createOrderDto = new CreateOrderDto
            {
                ShippingAddress = "123 Test Street",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { ProductId = product.Id, Quantity = 5 }
                }
            };

            // Act & Assert
            Assert.ThrowsAsync<Exception>(
                () => _orderService.CreateOrderAsync(1, createOrderDto));
        }

        [Test]
        public async Task CreateOrder_WithNonExistentProduct_ShouldThrowException()
        {
            // Arrange
            var createOrderDto = new CreateOrderDto
            {
                ShippingAddress = "123 Test Street",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { ProductId = 999, Quantity = 1 }
                }
            };

            // Act & Assert
            Assert.ThrowsAsync<Exception>(
                () => _orderService.CreateOrderAsync(1, createOrderDto));
        }

        [Test]
        public async Task GetUserOrders_WithExistingOrders_ShouldReturnOrders()
        {
            // Arrange
            var product = new Product 
            { 
                Name = "Test Product", 
                Description = "Test Description",
                Price = 15.99m, 
                Stock = 10, 
                Category = "Books",
                ImageUrl = "test.jpg"
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var order = new Order
            {
                UserId = 1,
                TotalAmount = 31.98m,
                Status = "Completed",
                ShippingAddress = "123 Test Street",
                CreatedAt = DateTime.UtcNow
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                Quantity = 2,
                Price = 15.99m
            };
            _context.OrderItems.Add(orderItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _orderService.GetUserOrdersAsync(1);

            // Assert
            Assert.That(result.Count(), Is.EqualTo(1));
            var orderDto = result.First();
            Assert.That(orderDto.UserId, Is.EqualTo(1));
            Assert.That(orderDto.TotalAmount, Is.EqualTo(31.98m));
            Assert.That(orderDto.Status, Is.EqualTo("Completed"));
        }

        [Test]
        public async Task GetUserOrders_WithoutOrders_ShouldReturnEmptyList()
        {
            // Act
            var result = await _orderService.GetUserOrdersAsync(999);

            // Assert
            Assert.That(result.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task GetOrderById_WithValidOrderAndUser_ShouldReturnOrder()
        {
            // Arrange
            var product = new Product 
            { 
                Name = "Test Product", 
                Description = "Test Description",
                Price = 20.99m, 
                Stock = 5, 
                Category = "Electronics",
                ImageUrl = "test.jpg"
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var order = new Order
            {
                UserId = 1,
                TotalAmount = 20.99m,
                Status = "Processing",
                ShippingAddress = "456 Test Avenue"
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = product.Id,
                Quantity = 1,
                Price = 20.99m
            };
            _context.OrderItems.Add(orderItem);
            await _context.SaveChangesAsync();

            // Act
            var result = await _orderService.GetOrderByIdAsync(order.Id, 1);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.EqualTo(order.Id));
            Assert.That(result.UserId, Is.EqualTo(1));
            Assert.That(result.Status, Is.EqualTo("Processing"));
        }

        [Test]
        public async Task GetOrderById_WithWrongUser_ShouldReturnNull()
        {
            // Arrange
            var order = new Order
            {
                UserId = 1,
                TotalAmount = 20.99m,
                Status = "Processing",
                ShippingAddress = "456 Test Avenue"
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Act
            var result = await _orderService.GetOrderByIdAsync(order.Id, 2);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task GetAllOrders_WithExistingOrders_ShouldReturnAllOrders()
        {
            // Arrange
            var product = new Product 
            { 
                Name = "Test Product", 
                Description = "Test Description",
                Price = 10.99m, 
                Stock = 20, 
                Category = "Books",
                ImageUrl = "test.jpg"
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var orders = new[]
            {
                new Order { UserId = 1, TotalAmount = 10.99m, Status = "Completed", ShippingAddress = "Address 1" },
                new Order { UserId = 2, TotalAmount = 21.98m, Status = "Processing", ShippingAddress = "Address 2" }
            };
            _context.Orders.AddRange(orders);
            await _context.SaveChangesAsync();

            // Act
            var result = await _orderService.GetAllOrdersAsync();

            // Assert
            Assert.That(result.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task UpdateOrderStatus_WithValidOrder_ShouldUpdateStatus()
        {
            // Arrange
            var order = new Order
            {
                UserId = 1,
                TotalAmount = 25.99m,
                Status = "Pending",
                ShippingAddress = "123 Test Street"
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Act
            var result = await _orderService.UpdateOrderStatusAsync(order.Id, "Shipped");

            // Assert
            Assert.That(result, Is.True);

            var updatedOrder = await _context.Orders.FindAsync(order.Id);
            Assert.That(updatedOrder!.Status, Is.EqualTo("Shipped"));
        }

        [Test]
        public async Task UpdateOrderStatus_WithNonExistentOrder_ShouldReturnFalse()
        {
            // Act
            var result = await _orderService.UpdateOrderStatusAsync(999, "Shipped");

            // Assert
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task CreateOrder_WithMultipleItems_ShouldCalculateTotalCorrectly()
        {
            // Arrange
            var product1 = new Product { Name = "Product 1", Description = "Desc 1", Price = 10.00m, Stock = 10, Category = "A", ImageUrl = "img1.jpg" };
            var product2 = new Product { Name = "Product 2", Description = "Desc 2", Price = 15.50m, Stock = 5, Category = "B", ImageUrl = "img2.jpg" };
            _context.Products.AddRange(product1, product2);
            await _context.SaveChangesAsync();

            var createOrderDto = new CreateOrderDto
            {
                ShippingAddress = "123 Test Street",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { ProductId = product1.Id, Quantity = 2 },
                    new CreateOrderItemDto { ProductId = product2.Id, Quantity = 1 }
                }
            };

            // Act
            var result = await _orderService.CreateOrderAsync(1, createOrderDto);

            // Assert
            Assert.That(result.TotalAmount, Is.EqualTo(35.50m)); // (10.00 * 2) + (15.50 * 1)
            Assert.That(result.OrderItems.Count, Is.EqualTo(2));
        }
    }
}