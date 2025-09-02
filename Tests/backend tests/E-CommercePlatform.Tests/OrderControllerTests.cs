using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Database.Context;
using Common.DTOs;
using E_CommercePlatform;
using Microsoft.Extensions.Configuration;

namespace E_CommercePlatform.Tests
{
    public class OrderControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public OrderControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string>
                    {
                        ["JwtSettings:Secret"] = "ThisIsAVeryLongSecretKeyForJWTTokenGenerationThatIsAtLeast32Characters",
                        ["JwtSettings:Issuer"] = "TestIssuer",
                        ["JwtSettings:Audience"] = "TestAudience"
                    });
                });
                
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<EcommerceDbContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);

                    services.AddDbContext<EcommerceDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("OrderTestDb" + Guid.NewGuid());
                    });
                });
            });

            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task GetOrders_WithoutAuth_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/Order");

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task CreateOrder_WithoutAuth_ReturnsUnauthorized()
        {
            // Arrange
            var orderDto = new CreateOrderDto
            {
                ShippingAddress = "123 Test Street",
                Items = new List<CreateOrderItemDto>
                {
                    new CreateOrderItemDto { ProductId = 1, Quantity = 2 }
                }
            };

            var json = JsonSerializer.Serialize(orderDto);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/api/Order", content);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetOrderById_WithoutAuth_ReturnsUnauthorized()
        {
            // Arrange
            var orderId = 1;

            // Act
            var response = await _client.GetAsync($"/api/Order/{orderId}");

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task CancelOrder_WithoutAuth_ReturnsUnauthorized()
        {
            // Arrange
            var orderId = 1;

            // Act
            var response = await _client.PutAsync($"/api/Order/{orderId}/cancel", null);

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.Unauthorized);
        }
    }
}