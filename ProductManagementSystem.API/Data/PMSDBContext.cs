using Microsoft.EntityFrameworkCore;
using ProductManagementSystem.API.Model;

namespace ProductManagementSystem.API.Data
{
    public class PMSDBContext:DbContext
    {
        public PMSDBContext(DbContextOptions<PMSDBContext> options) : base(options) { }
        public DbSet<Products> Products { get; set; }
    }
}
