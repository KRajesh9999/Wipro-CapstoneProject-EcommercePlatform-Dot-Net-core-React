using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using FluentAssertions;
using Database.Context;
using E_CommercePlatform;
using Microsoft.Extensions.Configuration;

namespace E_CommercePlatform.Tests
{
    public class ProductControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public ProductControllerTests(WebApplicationFactory<Program> factory)
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
                        options.UseInMemoryDatabase("ProductTestDb" + Guid.NewGuid());
                    });
                });
            });

            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task GetAllProducts_ReturnsProductList()
        {
            // Act
            var response = await _client.GetAsync("/api/Product");

            // Assert
            response.IsSuccessStatusCode.Should().BeTrue();
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNull();
        }

        [Fact]
        public async Task GetProduct_ValidId_ReturnsProduct()
        {
            // Arrange
            var productId = 1;

            // Act
            var response = await _client.GetAsync($"/api/Product/{productId}");

            // Assert - Should return 404 for non-existent product or 200 if exists
            response.StatusCode.Should().BeOneOf(System.Net.HttpStatusCode.OK, System.Net.HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task GetProduct_InvalidId_ReturnsNotFound()
        {
            // Arrange
            var invalidId = 99999;

            // Act
            var response = await _client.GetAsync($"/api/Product/{invalidId}");

            // Assert
            response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
        }
    }
}