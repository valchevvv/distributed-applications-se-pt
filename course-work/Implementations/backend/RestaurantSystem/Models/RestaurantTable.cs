using System.ComponentModel.DataAnnotations;

namespace RestaurantSystem.Models
{
    public class RestaurantTable
    {
        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Table number is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Table number must be at least 1")]
        public int Number { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Capacity must be at least 1")]
        public int Capacity { get; set; }

        [MaxLength(30, ErrorMessage = "Zone cannot exceed 30 characters")]
        public string? Zone { get; set; }

        public bool IsAvailable { get; set; } = true;

        public DateTime LastCleaned { get; set; }


        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}