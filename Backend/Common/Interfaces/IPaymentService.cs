using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Common.DTOs;

namespace Common.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResultDto> ProcessPaymentAsync(PaymentDto paymentDto);
        Task<bool> RefundPaymentAsync(string transactionId, decimal amount);
    }
}
