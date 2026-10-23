using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagementSystem.API.Data;
using ProductManagementSystem.API.Model;

namespace ProductManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : Controller
    {
       private readonly PMSDBContext _pmsdbContext;
       private readonly Cloudinary _cloudinary;
       public ProductsController(PMSDBContext pMSDBContext,Cloudinary cloudinary)
        {
            _pmsdbContext = pMSDBContext;
            _cloudinary = cloudinary;
        }

        [HttpGet]
       public async Task<ActionResult<IEnumerable<Products>>> GetProducts()
       {
            try
            {
                var products = await _pmsdbContext.Products.ToListAsync();
                return products;
            } catch (Exception ex)
            {
                return StatusCode(500,$"Internal Server Error {ex.Message}");
            }
       }

         [HttpPost]
         public async Task<ActionResult<Products>> AddProducts([FromForm] Products products)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest();
                }
                
                if(products.ImageFile  == null)
                {
                    return BadRequest();
                }
                string ImageUrl = string.Empty;
                using(var stream = products.ImageFile.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(products.ImageFile.FileName,stream),
                        Folder = "PMS",
                        Transformation = new Transformation().Height(800).Width(800).Crop("fill")
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if(uploadResult.Error != null)
                    {
                        return StatusCode(500, $"Error adding Image to cloudinary {uploadResult.Error.Message}");
                    };
                    ImageUrl = uploadResult.SecureUrl.ToString();
                };
                var product = new Products
                {
                    Title = products.Title,
                    Description = products.Description,
                    ImageURL = ImageUrl,
                    Status = products.Status,
                    Price = products.Price,
                    Quantity = products.Quantity,
                };

                await _pmsdbContext.AddAsync(product);
                await _pmsdbContext.SaveChangesAsync();

                return  products;
            }catch(Exception ex)
            {
                return StatusCode(500, $"Internal Server Error {ex.Message}");
            }
        }

        [HttpGet]
        [Route("{Id}")]
        public async Task<ActionResult<IEnumerable<Products>>> GetProductById ( int Id)
        {
            try
            {
                var product = await _pmsdbContext.Products.Where(p => p.Id == Id).FirstOrDefaultAsync();
                return Ok(product);
            }catch(Exception ex)
            {
                return StatusCode(500, $"Internal Server Error {ex.Message}");
            }
        }

        [HttpPut]
        [Route("{Id}")]
        public async Task<ActionResult<Products>> PutProducts (int Id,Products products)
        {
            try
            {
                if (Id != products.Id)
                {
                    return BadRequest("The Id of the product is not same");
                }

                _pmsdbContext.Entry(products).State = EntityState.Modified;
                //_pmsdbContext.Products.Update(products);
                await _pmsdbContext.SaveChangesAsync();
                return products;
            }catch(Exception ex)
            {
                return StatusCode(500, $"Internal Server Error {ex.Message}");
            }
        }

        [HttpDelete]
        [Route("{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _pmsdbContext.Products.Where(p => p.Id == id).FirstOrDefaultAsync();
                if(product == null)
                {
                    return NotFound($"Product not Found {id}");
                }
                _pmsdbContext.Products.Remove(product);

                await _pmsdbContext.SaveChangesAsync();
                return NoContent();

            }catch(Exception ex)
            {
                return StatusCode(500, $"Internal Server Error {ex.Message}");
            }
        }

    }
}
