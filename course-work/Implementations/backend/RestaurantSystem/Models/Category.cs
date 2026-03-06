using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantSystem.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Category name is required")]
        [MaxLength(50, ErrorMessage = "Name cannot exceed 50 characters")]
        public string Name { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public bool IsActive { get; set; } = true;

        [Range(0, double.MaxValue, ErrorMessage = "Priority cannot be negative")]
        public double Priority { get; set; }

        
        public virtual ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    }
}