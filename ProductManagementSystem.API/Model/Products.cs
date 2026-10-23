using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductManagementSystem.API.Model
{
    public class Products
    {
        [Key]
        public int Id { get; set; }

        [JsonProperty("title")]
        public string Title { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("quantity")]
        public int Quantity { get; set; }

        [JsonProperty("price")]
        public int Price { get; set; }

        [JsonProperty("status")]
        public bool Status { get; set; }

        [JsonProperty("imageURL")]
        public string? ImageURL { get; set; }

        [NotMapped]
        [JsonProperty("imageFile")]
        public IFormFile? ImageFile { get; set; }
    }
}
