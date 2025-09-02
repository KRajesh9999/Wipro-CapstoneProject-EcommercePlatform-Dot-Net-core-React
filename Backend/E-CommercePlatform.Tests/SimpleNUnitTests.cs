using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http;
using NUnit.Framework;
using Database.Context;

namespace E_CommercePlatform.Tests
{
    [TestFixture]
    public class SimpleNUnitTests
    {
        private HttpClient _client;
        private WebApplicationFactory<Program> _factory;

        [SetUp]
        public void Setup()
        {
            _factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<EcommerceDbContext>));
                    if (descriptor != null) services.Remove(descriptor);
                    
                    services.AddDbContext<EcommerceDbContext>(options =>
                        options.UseInMemoryDatabase("TestDb" + Guid.NewGuid()));
                });
            });
            _client = _factory.CreateClient();
        }

        [TearDown]
        public void TearDown()
        {
            _client?.Dispose();
            _factory?.Dispose();
        }

        [Test]
        public async Task GetProductsEndpoint_ShouldReturnResponse()
        {
            var response = await _client.GetAsync("/api/Product");
            Assert.That(response, Is.Not.Null);
        }

        [Test]
        public async Task SwaggerEndpoint_ShouldBeAccessible()
        {
            var response = await _client.GetAsync("/swagger/v1/swagger.json");
            Assert.That(response.IsSuccessStatusCode, Is.True);
        }

        [Test]
        public async Task ProtectedEndpoint_ShouldReturnUnauthorized_WhenNoToken()
        {
            var response = await _client.GetAsync("/api/Cart");
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.Unauthorized));
        }

        [Test]
        public async Task InvalidEndpoint_ShouldReturnNotFound()
        {
            var response = await _client.GetAsync("/api/NonExistent");
            Assert.That(response.StatusCode, Is.EqualTo(System.Net.HttpStatusCode.NotFound));
        }

        [Test]
        public void HttpClient_ShouldBeCreated()
        {
            Assert.That(_client, Is.Not.Null);
        }
    }
}