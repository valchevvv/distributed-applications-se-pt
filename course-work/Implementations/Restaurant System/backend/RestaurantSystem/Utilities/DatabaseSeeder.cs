using RestaurantSystem.Data;
using RestaurantSystem.Models;

namespace RestaurantSystem.Utilities
{
    public static class DatabaseSeeder
    {
        public static void SeedData(RestaurantDbContext context)
        {
            if (context.Users.Any() || context.Categories.Any())
                return;

            var users = new List<User>
            {
                new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin_pass"),
                    Email = "admin@restaurant.com",
                    Role = "Admin",
                    CreatedAt = DateTime.Now,
                    IsActive = true
                },
                new User
                {
                    Username = "manager",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager_pass"),
                    Email = "manager@restaurant.com",
                    Role = "Manager",
                    CreatedAt = DateTime.Now,
                    IsActive = true
                }
            };
            context.Users.AddRange(users);
            context.SaveChanges();

            var categories = new List<Category>
            {
                new Category { Name = "Appetizers", Priority = 1, IsActive = true, CreatedDate = DateTime.Now },
                new Category { Name = "Soups", Priority = 2, IsActive = true, CreatedDate = DateTime.Now },
                new Category { Name = "Main Courses", Priority = 3, IsActive = true, CreatedDate = DateTime.Now },
                new Category { Name = "Sides", Priority = 4, IsActive = true, CreatedDate = DateTime.Now },
                new Category { Name = "Desserts", Priority = 5, IsActive = true, CreatedDate = DateTime.Now },
                new Category { Name = "Beverages", Priority = 6, IsActive = true, CreatedDate = DateTime.Now }
            };
            context.Categories.AddRange(categories);
            context.SaveChanges();

            var menuItems = new List<MenuItem>
            {
                new MenuItem
                {
                    Title = "Cheese Banitsa",
                    Price = 6.50m,
                    Calories = 320,
                    InternalBarcode = 1001,
                    CategoryId = categories[0].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "European Salad",
                    Price = 8.00m,
                    Calories = 180,
                    InternalBarcode = 1002,
                    CategoryId = categories[0].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Fried Meatballs",
                    Price = 7.50m,
                    Calories = 280,
                    InternalBarcode = 1003,
                    CategoryId = categories[0].Id,
                    IsAvailable = true
                },

                new MenuItem
                {
                    Title = "Meat Soup",
                    Price = 5.00m,
                    Calories = 150,
                    InternalBarcode = 2001,
                    CategoryId = categories[1].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Chicken Soup",
                    Price = 5.00m,
                    Calories = 140,
                    InternalBarcode = 2002,
                    CategoryId = categories[1].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Tripe Soup",
                    Price = 6.50m,
                    Calories = 200,
                    InternalBarcode = 2003,
                    CategoryId = categories[1].Id,
                    IsAvailable = true
                },

                new MenuItem
                {
                    Title = "Pljeskavica",
                    Price = 14.00m,
                    Calories = 580,
                    InternalBarcode = 3001,
                    CategoryId = categories[2].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Grilled Chicken",
                    Price = 12.50m,
                    Calories = 520,
                    InternalBarcode = 3002,
                    CategoryId = categories[2].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Fish with Olives",
                    Price = 15.00m,
                    Calories = 480,
                    InternalBarcode = 3003,
                    CategoryId = categories[2].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Meat Dumpling",
                    Price = 11.00m,
                    Calories = 420,
                    InternalBarcode = 3004,
                    CategoryId = categories[2].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Pork Chop",
                    Price = 13.50m,
                    Calories = 560,
                    InternalBarcode = 3005,
                    CategoryId = categories[2].Id,
                    IsAvailable = true
                },

                new MenuItem
                {
                    Title = "Fried Potatoes",
                    Price = 3.50m,
                    Calories = 280,
                    InternalBarcode = 4001,
                    CategoryId = categories[3].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Rice",
                    Price = 3.00m,
                    Calories = 200,
                    InternalBarcode = 4002,
                    CategoryId = categories[3].Id,
                    IsAvailable = true
                },

                new MenuItem
                {
                    Title = "Baklava",
                    Price = 5.50m,
                    Calories = 380,
                    InternalBarcode = 5001,
                    CategoryId = categories[4].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Chocolate Crepe",
                    Price = 6.00m,
                    Calories = 420,
                    InternalBarcode = 5002,
                    CategoryId = categories[4].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Karamanbread Mousse",
                    Price = 5.00m,
                    Calories = 340,
                    InternalBarcode = 5003,
                    CategoryId = categories[4].Id,
                    IsAvailable = true
                },

                new MenuItem
                {
                    Title = "Home-made Liqueur",
                    Price = 2.50m,
                    Calories = 60,
                    InternalBarcode = 6001,
                    CategoryId = categories[5].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Heineken Beer",
                    Price = 3.00m,
                    Calories = 140,
                    InternalBarcode = 6002,
                    CategoryId = categories[5].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Coca-Cola",
                    Price = 2.00m,
                    Calories = 140,
                    InternalBarcode = 6003,
                    CategoryId = categories[5].Id,
                    IsAvailable = true
                },
                new MenuItem
                {
                    Title = "Orange Juice",
                    Price = 2.50m,
                    Calories = 110,
                    InternalBarcode = 6004,
                    CategoryId = categories[5].Id,
                    IsAvailable = true
                }
            };
            context.MenuItems.AddRange(menuItems);
            context.SaveChanges();

            var employees = new List<Employee>
            {
                new Employee
                {
                    FullName = "Ivan Popov",
                    Salary = 1200,
                    Phone = 359888123456,
                    HireDate = new DateTime(2023, 1, 15),
                    Role = "Waiter"
                },
                new Employee
                {
                    FullName = "Maria Georgieva",
                    Salary = 1200,
                    Phone = 359888234567,
                    HireDate = new DateTime(2023, 3, 20),
                    Role = "Waiter"
                },
                new Employee
                {
                    FullName = "Peter Vasilev",
                    Salary = 1200,
                    Phone = 359888345678,
                    HireDate = new DateTime(2023, 2, 10),
                    Role = "Waiter"
                },
                new Employee
                {
                    FullName = "Elena Stefanova",
                    Salary = 1500,
                    Phone = 359888456789,
                    HireDate = new DateTime(2022, 6, 1),
                    Role = "Chef"
                },
                new Employee
                {
                    FullName = "Sergey Petrov",
                    Salary = 1300,
                    Phone = 359888567890,
                    HireDate = new DateTime(2022, 9, 15),
                    Role = "Chef Assistant"
                },
                new Employee
                {
                    FullName = "Anna Nikolova",
                    Salary = 1100,
                    Phone = 359888678901,
                    HireDate = new DateTime(2023, 4, 1),
                    Role = "Cashier"
                }
            };
            context.Employees.AddRange(employees);
            context.SaveChanges();

            var tables = new List<RestaurantTable>();
            for (int i = 1; i <= 15; i++)
            {
                string zone = i <= 5 ? "Window" : (i <= 10 ? "Center" : "Corner");
                int capacity = (i % 3) + 2;

                tables.Add(new RestaurantTable
                {
                    Number = i,
                    Capacity = capacity,
                    Zone = zone,
                    IsAvailable = true,
                    LastCleaned = DateTime.Now
                });
            }
            context.Tables.AddRange(tables);
            context.SaveChanges();

            var orders = new List<Order>
            {
                new Order
                {
                    OrderTime = DateTime.Now.AddHours(-2),
                    TableId = tables[0].Id,
                    EmployeeId = employees[0].Id,
                    Status = "Paid",
                    TotalPrice = 35.50m
                },
                new Order
                {
                    OrderTime = DateTime.Now.AddHours(-1),
                    TableId = tables[1].Id,
                    EmployeeId = employees[1].Id,
                    Status = "Served",
                    TotalPrice = 42.00m
                },
                new Order
                {
                    OrderTime = DateTime.Now.AddMinutes(-30),
                    TableId = tables[2].Id,
                    EmployeeId = employees[0].Id,
                    Status = "In Progress",
                    TotalPrice = 29.00m
                }
            };
            context.Orders.AddRange(orders);
            context.SaveChanges();

            var orderDetails = new List<OrderDetail>
            {
                // Order 1: Table 1 - realistic full meal
                new OrderDetail
                {
                    OrderId = orders[0].Id,
                    MenuItemId = menuItems[9].Id,   // Meat Dumpling
                    Quantity = 1,
                    SubTotal = menuItems[9].Price * 1,
                    Note = "Main course for guest"
                },
                new OrderDetail
                {
                    OrderId = orders[0].Id,
                    MenuItemId = menuItems[1].Id,   // European Salad
                    Quantity = 1,
                    SubTotal = menuItems[1].Price * 1,
                    Note = "Shared starter"
                },
                new OrderDetail
                {
                    OrderId = orders[0].Id,
                    MenuItemId = menuItems[11].Id,  // Fried Potatoes
                    Quantity = 3,
                    SubTotal = menuItems[11].Price * 3,
                    Note = "Side dish for the table"
                },
                new OrderDetail
                {
                    OrderId = orders[0].Id,
                    MenuItemId = menuItems[17].Id,  // Heineken Beer
                    Quantity = 2,
                    SubTotal = menuItems[17].Price * 2,
                    Note = "Drinks"
                },

                // Order 2: Table 2 - two mains with side
                new OrderDetail
                {
                    OrderId = orders[1].Id,
                    MenuItemId = menuItems[6].Id,   // Pljeskavica
                    Quantity = 1,
                    SubTotal = menuItems[6].Price * 1,
                    Note = "Main course"
                },
                new OrderDetail
                {
                    OrderId = orders[1].Id,
                    MenuItemId = menuItems[7].Id,   // Grilled Chicken
                    Quantity = 2,
                    SubTotal = menuItems[7].Price * 2,
                    Note = "Two grilled chicken portions"
                },
                new OrderDetail
                {
                    OrderId = orders[1].Id,
                    MenuItemId = menuItems[12].Id,  // Rice
                    Quantity = 1,
                    SubTotal = menuItems[12].Price * 1,
                    Note = "Side dish"
                },

                // Order 3: Table 3 - mixed meal with drinks
                new OrderDetail
                {
                    OrderId = orders[2].Id,
                    MenuItemId = menuItems[6].Id,   // Pljeskavica
                    Quantity = 1,
                    SubTotal = menuItems[6].Price * 1,
                    Note = "Main course"
                },
                new OrderDetail
                {
                    OrderId = orders[2].Id,
                    MenuItemId = menuItems[1].Id,   // European Salad
                    Quantity = 1,
                    SubTotal = menuItems[1].Price * 1,
                    Note = "Starter"
                },
                new OrderDetail
                {
                    OrderId = orders[2].Id,
                    MenuItemId = menuItems[12].Id,  // Rice
                    Quantity = 1,
                    SubTotal = menuItems[12].Price * 1,
                    Note = "Side dish"
                },
                new OrderDetail
                {
                    OrderId = orders[2].Id,
                    MenuItemId = menuItems[18].Id,  // Coca-Cola
                    Quantity = 2,
                    SubTotal = menuItems[18].Price * 2,
                    Note = "Soft drinks"
                }
            };

            context.OrderDetails.AddRange(orderDetails);
            context.SaveChanges();
        }
    }
}
