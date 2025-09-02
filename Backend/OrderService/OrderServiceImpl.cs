using Common.DTOs;
using Common.Interfaces;
using Database.Context;
using Database.Models;
using Microsoft.EntityFrameworkCore;

namespace OrderService
{
    public class OrderServiceImpl : IOrderService
    {
        private readonly EcommerceDbContext _context;

        public OrderServiceImpl(EcommerceDbContext context)
        {
            _context = context;
        }

        public async Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto createOrderDto)
        {
            var order = new Order
            {
                UserId = userId,
                ShippingAddress = createOrderDto.ShippingAddress,
                Status = "Pending"
            };

            decimal totalAmount = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in createOrderDto.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null || product.Stock < item.Quantity)
                    throw new Exception($"Product {item.ProductId} not available");

                var orderItem = new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = product.Price
                };

                orderItems.Add(orderItem);
                totalAmount += product.Price * item.Quantity;
                product.Stock -= item.Quantity;
            }

            order.TotalAmount = totalAmount;
            order.OrderItems = orderItems;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return await GetOrderByIdAsync(order.Id, userId);
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<OrderDto> GetOrderByIdAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            return order == null ? null : MapToOrderDto(order);
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapToOrderDto);
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return false;

            order.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        private OrderDto MapToOrderDto(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                ShippingAddress = order.ShippingAddress,
                CreatedAt = order.CreatedAt,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    Price = oi.Price,
                    Subtotal = oi.Price * oi.Quantity
                }).ToList()
            };
        }
    }
}

