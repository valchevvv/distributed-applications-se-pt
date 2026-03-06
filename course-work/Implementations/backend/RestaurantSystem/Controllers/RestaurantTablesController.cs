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
    public class RestaurantTablesController : ControllerBase
    {
        private readonly RestaurantDbContext _context;

        public RestaurantTablesController(RestaurantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RestaurantTable>>> GetTables(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var query = _context.Tables
                .Include(t => t.Orders)
                .AsQueryable();

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var tables = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());
            Response.Headers.Add("X-Current-Page", pageNumber.ToString());

            return Ok(tables);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<RestaurantTable>>> SearchTables(
            [FromQuery] int? number,
            [FromQuery] string? zone,
            [FromQuery] int? minCapacity,
            [FromQuery] bool? isAvailable,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var query = _context.Tables
                .Include(t => t.Orders)
                .AsQueryable();

            if (number.HasValue)
            {
                query = query.Where(t => t.Number == number.Value);
            }

            if (!string.IsNullOrWhiteSpace(zone))
            {
                query = query.Where(t => t.Zone != null && t.Zone.Contains(zone));
            }

            if (minCapacity.HasValue)
            {
                query = query.Where(t => t.Capacity >= minCapacity.Value);
            }

            if (isAvailable.HasValue)
            {
                query = query.Where(t => t.IsAvailable == isAvailable.Value);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var tables = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());

            return Ok(tables);
        }

        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<RestaurantTable>>> GetAvailableTables(
            [FromQuery] DateTime? forDate,
            [FromQuery] int? capacity)
        {
            var query = _context.Tables
                .Where(t => t.IsAvailable)
                .AsQueryable();

            if (capacity.HasValue)
            {
                query = query.Where(t => t.Capacity >= capacity.Value);
            }

            if (forDate.HasValue)
            {
                var busyTableIds = await _context.Orders
                    .Where(o => o.OrderTime.Date == forDate.Value.Date)
                    .Select(o => o.TableId)
                    .Distinct()
                    .ToListAsync();

                query = query.Where(t => !busyTableIds.Contains(t.Id));
            }

            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RestaurantTable>> GetTable(int id)
        {
            var table = await _context.Tables
                .Include(t => t.Orders)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (table == null)
            {
                return NotFound($"Table with ID {id} does not exist.");
            }

            return Ok(table);
        }

        [HttpPost]
        public async Task<ActionResult<RestaurantTable>> CreateTable(RestaurantTable table)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var exists = await _context.Tables
                .AnyAsync(t => t.Number == table.Number);

            if (exists)
            {
                return BadRequest($"A table with number {table.Number} already exists.");
            }

            _context.Tables.Add(table);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTable), new { id = table.Id }, table);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTable(int id, RestaurantTable table)
        {
            if (id != table.Id)
            {
                return BadRequest("The ID in the URL does not match the table ID.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var exists = await _context.Tables
                .AnyAsync(t => t.Number == table.Number && t.Id != id);

            if (exists)
            {
                return BadRequest($"A table with number {table.Number} already exists.");
            }

            _context.Entry(table).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await TableExists(id))
                {
                    return NotFound($"Table with ID {id} does not exist.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpPatch("{id}/toggle-availability")]
        public async Task<IActionResult> ToggleAvailability(int id)
        {
            var table = await _context.Tables.FindAsync(id);

            if (table == null)
            {
                return NotFound($"Table with ID {id} does not exist.");
            }

            table.IsAvailable = !table.IsAvailable;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Table {table.Number} availability changed to {(table.IsAvailable ? "available" : "occupied")}",
                isAvailable = table.IsAvailable
            });
        }

        [HttpPatch("{id}/clean")]
        public async Task<IActionResult> MarkAsCleaned(int id)
        {
            var table = await _context.Tables.FindAsync(id);

            if (table == null)
            {
                return NotFound($"Table with ID {id} does not exist.");
            }

            table.LastCleaned = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Table {table.Number} marked as cleaned.",
                lastCleaned = table.LastCleaned
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTable(int id)
        {
            var table = await _context.Tables
                .Include(t => t.Orders)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (table == null)
            {
                return NotFound($"Table with ID {id} does not exist.");
            }

            if (table.Orders != null && table.Orders.Any())
            {
                return BadRequest($"Cannot delete table {table.Number} as it has {table.Orders.Count} associated orders.");
            }

            _context.Tables.Remove(table);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Table {table.Number} was successfully deleted." });
        }

        private async Task<bool> TableExists(int id)
        {
            return await _context.Tables.AnyAsync(e => e.Id == id);
        }
    }
}