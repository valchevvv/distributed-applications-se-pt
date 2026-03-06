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
    public class EmployeesController : ControllerBase
    {
        private readonly RestaurantDbContext _context;

        public EmployeesController(RestaurantDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var query = _context.Employees
                .Include(e => e.Orders)
                .AsQueryable();

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var employees = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());
            Response.Headers.Add("X-Current-Page", pageNumber.ToString());

            return Ok(employees);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Employee>>> SearchEmployees(
            [FromQuery] string? name,
            [FromQuery] string? role,
            [FromQuery] DateTime? hiredAfter,
            [FromQuery] DateTime? hiredBefore,
            [FromQuery] double? minSalary,
            [FromQuery] double? maxSalary,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 50) pageSize = 50;

            var query = _context.Employees
                .Include(e => e.Orders)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(e => e.FullName.Contains(name));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(e => e.Role != null && e.Role.Contains(role));
            }

            if (hiredAfter.HasValue)
            {
                query = query.Where(e => e.HireDate >= hiredAfter.Value);
            }

            if (hiredBefore.HasValue)
            {
                query = query.Where(e => e.HireDate <= hiredBefore.Value);
            }

            if (minSalary.HasValue)
            {
                query = query.Where(e => e.Salary >= minSalary.Value);
            }

            if (maxSalary.HasValue)
            {
                query = query.Where(e => e.Salary <= maxSalary.Value);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var employees = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Total-Pages", totalPages.ToString());

            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _context.Employees
                .Include(e => e.Orders)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null)
            {
                return NotFound($"Employee with ID {id} does not exist.");
            }

            return Ok(employee);
        }

        [HttpGet("role/{role}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesByRole(string role)
        {
            var employees = await _context.Employees
                .Where(e => e.Role == role)
                .ToListAsync();

            return Ok(employees);
        }

        [HttpPost]
        public async Task<ActionResult<Employee>> CreateEmployee(Employee employee)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var phoneExists = await _context.Employees
                .AnyAsync(e => e.Phone == employee.Phone);

            if (phoneExists)
            {
                return BadRequest($"An employee with phone number {employee.Phone} already exists.");
            }

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, Employee employee)
        {
            if (id != employee.Id)
            {
                return BadRequest("The ID in the URL does not match the employee ID.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var phoneExists = await _context.Employees
                .AnyAsync(e => e.Phone == employee.Phone && e.Id != id);

            if (phoneExists)
            {
                return BadRequest($"An employee with phone number {employee.Phone} already exists.");
            }

            _context.Entry(employee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await EmployeeExists(id))
                {
                    return NotFound($"Employee with ID {id} does not exist.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees
                .Include(e => e.Orders)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null)
            {
                return NotFound($"Employee with ID {id} does not exist.");
            }

            if (employee.Orders != null && employee.Orders.Any())
            {
                return BadRequest($"You cannot delete employee '{employee.FullName}' because there are {employee.Orders.Count} associated orders.");
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Employee '{employee.FullName}' was successfully deleted." });
        }

        private async Task<bool> EmployeeExists(int id)
        {
            return await _context.Employees.AnyAsync(e => e.Id == id);
        }
    }
}