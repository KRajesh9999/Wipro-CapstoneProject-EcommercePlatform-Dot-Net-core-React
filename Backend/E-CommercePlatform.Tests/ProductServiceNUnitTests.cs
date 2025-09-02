using Microsoft.EntityFrameworkCore;
using Database.Context;
using Database.Models;
using ProductService;
using Common.DTOs;

namespace E_CommercePlatform.Tests
{
    [TestFixture]
    public class ProductServiceTests
    {
        private EcommerceDbContext _context;
        private ProductServiceImpl _productService;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<EcommerceDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb" + Guid.NewGuid())
                .Options;

            _context = new EcommerceDbContext(options);
            _productService = new ProductServiceImpl(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        [Test]
        public async Task GetAllProducts_WithEmptyDatabase_ShouldReturnEmptyList()
        {
            // Act
            var result = await _productService.GetAllProductsAsync();

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task GetAllProducts_WithExistingProducts_ShouldReturnAllProducts()
        {
            // Arrange
            var products = new List<Product>
            {
                new Product { Name = "Product 1", Description = "Desc 1", Price = 10.99m, Stock = 5, Category = "Electronics", ImageUrl = "img1.jpg" },
                new Product { Name = "Product 2", Description = "Desc 2", Price = 20.99m, Stock = 10, Category = "Books", ImageUrl = "img2.jpg" }
            };

            _context.Products.AddRange(products);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productService.GetAllProductsAsync();

            // Assert
            Assert.That(result.Count(), Is.EqualTo(2));
            Assert.That(result.First().Name, Is.EqualTo("Product 1"));
            Assert.That(result.Last().Name, Is.EqualTo("Product 2"));
        }

        [Test]
        public async Task GetProductById_WithExistingProduct_ShouldReturnProduct()
        {
            // Arrange
            var product = new Product 
            { 
                Name = "Test Product", 
                Description = "Test Description",
                Price = 15.99m, 
                Stock = 8, 
                Category = "Electronics",
                ImageUrl = "test.jpg"
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productService.GetProductByIdAsync(product.Id);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Name, Is.EqualTo("Test Product"));
            Assert.That(result.Price, Is.EqualTo(15.99m));
            Assert.That(result.Stock, Is.EqualTo(8));
        }

        [Test]
        public async Task GetProductById_WithNonExistingProduct_ShouldReturnNull()
        {
            // Act
            var result = await _productService.GetProductByIdAsync(999);

            // Assert
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task CreateProduct_WithValidData_ShouldReturnCreatedProduct()
        {
            // Arrange
            var productDto = new ProductDto
            {
                Name = "New Product",
                Description = "New Description",
                Price = 25.99m,
                Stock = 15,
                Category = "Books",
                ImageUrl = "new.jpg"
            };

            // Act
            var result = await _productService.CreateProductAsync(productDto);

            // Assert
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Id, Is.GreaterThan(0));
            Assert.That(result.Name, Is.EqualTo("New Product"));

            var productInDb = await _context.Products.FindAsync(result.Id);
            Assert.That(productInDb, Is.Not.Null);
            Assert.That(productInDb.Name, Is.EqualTo("New Product"));
        }

        [Test]
        public async Task UpdateProduct_WithExistingProduct_ShouldReturnTrue()
        {
            // Arrange
            var product = new Product 
            { 
                Name = "Original Product", 
                Description = "Original Description",
                Price = 10.99m, 
                Stock = 5, 
                Category = "Electronics",
                ImageUrl = "original.jpg"
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            var updateDto = new ProductDto
            {
                Name = "Updated Product",
                Description = "Updated Description",
                Price = 19.99m,
                Stock = 10,
                Category = "Books",
                ImageUrl = "updated.jpg"
            };

            // Act
            var result = await _productService.UpdateProductAsync(product.Id, updateDto);

            // Assert
            Assert.That(result, Is.True);

            var updatedProduct = await _context.Products.FindAsync(product.Id);
            Assert.That(updatedProduct.Name, Is.EqualTo("Updated Product"));
            Assert.That(updatedProduct.Price, Is.EqualTo(19.99m));
            Assert.That(updatedProduct.Stock, Is.EqualTo(10));
        }

        [Test]
        public async Task UpdateProduct_WithNonExistingProduct_ShouldReturnFalse()
        {
            // Arrange
            var updateDto = new ProductDto
            {
                Name = "Updated Product",
                Price = 19.99m,
                Stock = 10,
                Category = "Books"
            };

            // Act
            var result = await _productService.UpdateProductAsync(999, updateDto);

            // Assert
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task DeleteProduct_WithExistingProduct_ShouldReturnTrue()
        {
            // Arrange
            var product = new Product 
            { 
                Name = "Product to Delete", 
                Description = "Delete Description",
                Price = 10.99m, 
                Stock = 5, 
                Category = "Electronics",
                ImageUrl = "delete.jpg"
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Act
            var result = await _productService.DeleteProductAsync(product.Id);

            // Assert
            Assert.That(result, Is.True);

            var deletedProduct = await _context.Products.FindAsync(product.Id);
            Assert.That(deletedProduct, Is.Null);
        }

        [Test]
        public async Task DeleteProduct_WithNonExistingProduct_ShouldReturnFalse()
        {
            // Act
            var result = await _productService.DeleteProductAsync(999);

            // Assert
            Assert.That(result, Is.False);
        }
    }
}