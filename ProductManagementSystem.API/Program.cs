using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using ProductManagementSystem.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<PMSDBContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DataBaseConnection"));
});

var cloudinarySettings = builder.Configuration.GetSection("CloudinarySettings");
Account account = new Account(cloudinarySettings["CouldName"], cloudinarySettings["ApiKey"], cloudinarySettings["ApiSecret"]);
Cloudinary cloudinary = new Cloudinary(account);

builder.Services.AddSingleton(cloudinary);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AddReactApps", policy =>
    {
        policy.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AddReactApps");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
