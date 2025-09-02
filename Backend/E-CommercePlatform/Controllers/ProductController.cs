using Common.DTOs;
using Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace E_CommercePlatform.Controllers
{
    /// <summary>
    /// Product management controller for CRUD operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Tags("Products")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        /// <summary>
        /// Retrieves all products from the catalog
        /// </summary>
        /// <returns>List of all available products</returns>
        /// <response code="200">Returns the list of products</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }

        /// <summary>
        /// Retrieves a specific product by ID
        /// </summary>
        /// <param name="id">The product ID</param>
        /// <returns>Product details</returns>
        /// <response code="200">Returns the requested product</response>
        /// <response code="404">Product not found</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProductDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProduct([Required] int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound($"Product with ID {id} not found");

            return Ok(product);
        }

        /// <summary>
        /// Creates a new product (Admin only)
        /// </summary>
        /// <param name="productDto">Product information</param>
        /// <returns>Created product details</returns>
        /// <response code="201">Product created successfully</response>
        /// <response code="400">Invalid product data</response>
        /// <response code="401">Unauthorized access</response>
        /// <response code="403">Forbidden - Admin role required</response>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ProductDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateProduct([FromBody][Required] ProductDto productDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _productService.CreateProductAsync(productDto);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        /// <summary>
        /// Updates an existing product (Admin only)
        /// </summary>
        /// <param name="id">Product ID to update</param>
        /// <param name="productDto">Updated product information</param>
        /// <returns>No content on success</returns>
        /// <response code="204">Product updated successfully</response>
        /// <response code="400">Invalid product data</response>
        /// <response code="401">Unauthorized access</response>
        /// <response code="403">Forbidden - Admin role required</response>
        /// <response code="404">Product not found</response>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProduct([Required] int id, [FromBody][Required] ProductDto productDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _productService.UpdateProductAsync(id, productDto);
            if (!result)
                return NotFound($"Product with ID {id} not found");

            return NoContent();
        }

        /// <summary>
        /// Deletes a product (Admin only)
        /// </summary>
        /// <param name="id">Product ID to delete</param>
        /// <returns>No content on success</returns>
        /// <response code="204">Product deleted successfully</response>
        /// <response code="401">Unauthorized access</response>
        /// <response code="403">Forbidden - Admin role required</response>
        /// <response code="404">Product not found</response>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProduct([Required] int id)
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result)
                return NotFound($"Product with ID {id} not found");

            return NoContent();
        }
    }
}
