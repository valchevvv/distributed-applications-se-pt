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
    public class MenuItemsController : ControllerBase
    {
        private readonly RestaurantDbContext _context;

        public MenuItemsController(RestaurantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetMenuItems(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var query = _context.MenuItems
                .Include(m => m.Category)
                .AsQueryable();

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var menuItems = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());
            Response.Headers.Add("X-Current-Page", pageNumber.ToString());

            return Ok(menuItems);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<MenuItem>>> SearchMenuItems(
            [FromQuery] string? title,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] int? categoryId,
            [FromQuery] bool? isAvailable,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var query = _context.MenuItems
                .Include(m => m.Category)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(title))
            {
                query = query.Where(m => m.Title.Contains(title));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(m => m.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(m => m.Price <= maxPrice.Value);
            }

            if (categoryId.HasValue)
            {
                query = query.Where(m => m.CategoryId == categoryId.Value);
            }

            if (isAvailable.HasValue)
            {
                query = query.Where(m => m.IsAvailable == isAvailable.Value);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var menuItems = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());

            return Ok(menuItems);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MenuItem>> GetMenuItem(int id)
        {
            var menuItem = await _context.MenuItems
                .Include(m => m.Category)
                .Include(m => m.OrderDetails)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (menuItem == null)
            {
                return NotFound($"Menu item with ID {id} does not exist.");
            }

            return Ok(menuItem);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<MenuItem>>> GetMenuItemsByCategory(int categoryId)
        {
            var menuItems = await _context.MenuItems
                .Where(m => m.CategoryId == categoryId)
                .Include(m => m.Category)
                .ToListAsync();

            return Ok(menuItems);
        }

        [HttpPost]
        public async Task<ActionResult<MenuItem>> CreateMenuItem(MenuItem menuItem)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == menuItem.CategoryId);

            if (!categoryExists)
            {
                return BadRequest($"Category with ID {menuItem.CategoryId} does not exist.");
            }

            var barcodeExists = await _context.MenuItems
                .AnyAsync(m => m.InternalBarcode == menuItem.InternalBarcode);

            if (barcodeExists)
            {
                return BadRequest($"A menu item with barcode {menuItem.InternalBarcode} already exists.");
            }

            _context.MenuItems.Add(menuItem);
            await _context.SaveChangesAsync();

            await _context.Entry(menuItem).Reference(m => m.Category).LoadAsync();

            return CreatedAtAction(nameof(GetMenuItem), new { id = menuItem.Id }, menuItem);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMenuItem(int id, MenuItem menuItem)
        {
            if (id != menuItem.Id)
            {
                return BadRequest("The ID in the URL does not match the menu item ID.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == menuItem.CategoryId);

            if (!categoryExists)
            {
                return BadRequest($"Category with ID {menuItem.CategoryId} does not exist.");
            }

            var barcodeExists = await _context.MenuItems
                .AnyAsync(m => m.InternalBarcode == menuItem.InternalBarcode && m.Id != id);

            if (barcodeExists)
            {
                return BadRequest($"A menu item with barcode {menuItem.InternalBarcode} already exists.");
            }

            _context.Entry(menuItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await MenuItemExists(id))
                {
                    return NotFound($"Menu item with ID {id} does not exist.");
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
            var menuItem = await _context.MenuItems.FindAsync(id);

            if (menuItem == null)
            {
                return NotFound($"Menu item with ID {id} does not exist.");
            }

            menuItem.IsAvailable = !menuItem.IsAvailable;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"Availability of '{menuItem.Title}' has been changed to {(menuItem.IsAvailable ? "available" : "unavailable")}",
                isAvailable = menuItem.IsAvailable
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            var menuItem = await _context.MenuItems
                .Include(m => m.OrderDetails)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (menuItem == null)
            {
                return NotFound($"Menu item with ID {id} does not exist.");
            }

            if (menuItem.OrderDetails != null && menuItem.OrderDetails.Any())
            {
                return BadRequest($"You cannot delete menu item '{menuItem.Title}' because there are {menuItem.OrderDetails.Count} orders containing it.");
            }

            _context.MenuItems.Remove(menuItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Menu item '{menuItem.Title}' was successfully deleted." });
        }

        private async Task<bool> MenuItemExists(int id)
        {
            return await _context.MenuItems.AnyAsync(e => e.Id == id);
        }
    }
}