using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Data;
using RestaurantSystem.Models;

namespace RestaurantSystem.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly RestaurantDbContext _context;

        public OrdersController(RestaurantDbContext context)
        {
            _context = context;
        }

        public class UpdateStatusRequest
        {
            public string Status { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var query = _context.Orders
                .Include(o => o.Table)
                .Include(o => o.Waiter)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.MenuItem)
                .OrderByDescending(o => o.OrderTime)
                .AsQueryable();

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var orders = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());
            Response.Headers.Add("X-Current-Page", pageNumber.ToString());

            return Ok(orders);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Order>>> SearchOrders(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string? status,
            [FromQuery] int? tableId,
            [FromQuery] int? employeeId,
            [FromQuery] decimal? minTotal,
            [FromQuery] decimal? maxTotal,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var query = _context.Orders
                .Include(o => o.Table)
                .Include(o => o.Waiter)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.MenuItem)
                .AsQueryable();

            if (fromDate.HasValue)
            {
                query = query.Where(o => o.OrderTime >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(o => o.OrderTime <= toDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(o => o.Status.Contains(status));
            }

            if (tableId.HasValue)
            {
                query = query.Where(o => o.TableId == tableId.Value);
            }

            if (employeeId.HasValue)
            {
                query = query.Where(o => o.EmployeeId == employeeId.Value);
            }

            if (minTotal.HasValue)
            {
                query = query.Where(o => o.TotalPrice >= minTotal.Value);
            }

            if (maxTotal.HasValue)
            {
                query = query.Where(o => o.TotalPrice <= maxTotal.Value);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var orders = await query
                .OrderByDescending(o => o.OrderTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());

            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.Waiter)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.MenuItem)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound($"Order with ID {id} does not exist.");
            }

            return Ok(order);
        }

        [HttpGet("table/{tableId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByTable(int tableId)
        {
            var orders = await _context.Orders
                .Where(o => o.TableId == tableId)
                .Include(o => o.Table)
                .Include(o => o.Waiter)
                .Include(o => o.OrderDetails)
                .OrderByDescending(o => o.OrderTime)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByEmployee(int employeeId)
        {
            var orders = await _context.Orders
                .Where(o => o.EmployeeId == employeeId)
                .Include(o => o.Table)
                .Include(o => o.Waiter)
                .Include(o => o.OrderDetails)
                .OrderByDescending(o => o.OrderTime)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByStatus(string status)
        {
            var orders = await _context.Orders
                .Where(o => o.Status == status)
                .Include(o => o.Table)
                .Include(o => o.Waiter)
                .OrderByDescending(o => o.OrderTime)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("date/{date}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByDate(DateTime date)
        {
            var orders = await _context.Orders
                .Where(o => o.OrderTime.Date == date.Date)
                .Include(o => o.Table)
                .Include(o => o.Waiter)
                .Include(o => o.OrderDetails)
                .OrderByDescending(o => o.OrderTime)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var tableExists = await _context.Tables.AnyAsync(t => t.Id == order.TableId);
            if (!tableExists)
            {
                return BadRequest($"Table with ID {order.TableId} does not exist.");
            }

            var employeeExists = await _context.Employees.AnyAsync(e => e.Id == order.EmployeeId);
            if (!employeeExists)
            {
                return BadRequest($"Employee with ID {order.EmployeeId} does not exist.");
            }

            order.OrderTime = DateTime.Now;
            order.TotalPrice = 0;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            await _context.Entry(order).Reference(o => o.Table).LoadAsync();
            await _context.Entry(order).Reference(o => o.Waiter).LoadAsync();

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        [HttpPost("{id}/add-item")]
        public async Task<IActionResult> AddItemToOrder(int id, OrderDetail orderDetail)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound($"Order with ID {id} does not exist.");
            }

            var menuItem = await _context.MenuItems.FindAsync(orderDetail.MenuItemId);
            if (menuItem == null)
            {
                return BadRequest($"Menu item with ID {orderDetail.MenuItemId} does not exist.");
            }

            orderDetail.OrderId = id;
            orderDetail.SubTotal = menuItem.Price * orderDetail.Quantity;

            _context.OrderDetails.Add(orderDetail);
            await _context.SaveChangesAsync();

            order.TotalPrice = order.OrderDetails.Sum(od => od.SubTotal);
            await _context.SaveChangesAsync();

            return Ok(orderDetail);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, Order order)
        {
            if (id != order.Id)
            {
                return BadRequest("The ID in the URL does not match the order ID.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await OrderExists(id))
                {
                    return NotFound($"Order with ID {id} does not exist.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest("The new status is required.");
            }

            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound($"Order with ID {id} does not exist.");
            }

            order.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"The status of order {id} has been changed to '{request.Status}'",
                status = order.Status
            });
        }

        [HttpPatch("{id}/calculate-total")]
        public async Task<IActionResult> CalculateOrderTotal(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound($"Order with ID {id} does not exist.");
            }

            order.TotalPrice = order.OrderDetails.Sum(od => od.SubTotal);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"The total amount for order {id} has been recalculated.",
                totalPrice = order.TotalPrice
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound($"Order with ID {id} does not exist.");
            }

            _context.OrderDetails.RemoveRange(order.OrderDetails);

            _context.Orders.Remove(order);

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Order with ID {id} was successfully deleted." });
        }

        private async Task<bool> OrderExists(int id)
        {
            return await _context.Orders.AnyAsync(e => e.Id == id);
        }
    }
}