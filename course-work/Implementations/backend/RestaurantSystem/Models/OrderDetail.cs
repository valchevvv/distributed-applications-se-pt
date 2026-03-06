using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace RestaurantSystem.Models
{
    public class OrderDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [BindNever]
        public int Id { get; set; }

        [Required(ErrorMessage = "Order is required")]
        public int OrderId { get; set; }

        [Required(ErrorMessage = "Menu item is required")]
        public int MenuItemId { get; set; }

        [Required(ErrorMessage = "Quantity is required")]
        [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100")]
        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [MaxLength(200, ErrorMessage = "Note cannot exceed 200 characters")]
        public string? Note { get; set; }

        
        [ForeignKey("OrderId")]
        [BindNever]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual Order? Order { get; set; }

        [ForeignKey("MenuItemId")]
        [BindNever]
        [System.Text.Json.Serialization.JsonIgnore]
        public virtual MenuItem? MenuItem { get; set; }
    }
}