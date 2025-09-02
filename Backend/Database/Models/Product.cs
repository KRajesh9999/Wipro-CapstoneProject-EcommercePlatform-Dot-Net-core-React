using System.ComponentModel.DataAnnotations;

namespace Database.Models
{
    public class Product
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; }
        
        public string Description { get; set; }
        
        [Required]
        public decimal Price { get; set; }
        
        public int Stock { get; set; }
        
        [StringLength(100)]
        public string Category { get; set; }
        
        public string ImageUrl { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}