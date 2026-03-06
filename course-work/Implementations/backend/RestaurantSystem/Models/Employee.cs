using System.ComponentModel.DataAnnotations;

namespace RestaurantSystem.Models
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Employee name is required")]
        [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string FullName { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Salary cannot be negative")]
        public double Salary { get; set; }

        [Required(ErrorMessage = "Phone number is required")]
        [Range(10000000, long.MaxValue, ErrorMessage = "Phone number must contain at least 8 digits")]
        public long Phone { get; set; }

        [Required(ErrorMessage = "Hire date is required")]
        public DateTime HireDate { get; set; }

        [MaxLength(50, ErrorMessage = "Role cannot exceed 50 characters")]
        public string? Role { get; set; }


        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}