using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Common.DTOs;

namespace Common.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(int userId, CreateOrderDto createOrderDto);
        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId);
        Task<OrderDto> GetOrderByIdAsync(int orderId, int userId);
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync(); // Admin only
        Task<bool> UpdateOrderStatusAsync(int orderId, string status); // Admin only
    }
}
