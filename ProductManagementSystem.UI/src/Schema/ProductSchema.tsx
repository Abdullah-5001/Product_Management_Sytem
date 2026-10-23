import z from "zod";

export const ProductSchema = z.object({
  Id: z.number().int().optional(),
  Title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be less than 100 characters" }),
  Description: z
    .string()
    .min(1, { message: "Descriptin is required" })
    .max(500, { message: "Description must be less than 500 characters" }),
  ImageUrl: z
    .string()
    .url({ message: "ImageUrl must be a valid URL" })
    .optional(),
  ImageFile: z.instanceof(File).nullable().optional(),
  Quantity: z
    .number()
    .int()
    .min(0, { message: "Quantity must be a positive integer" }),
  Price: z.number().min(0, { message: "Price must be a positive number" }),
});

export type Product = z.infer<typeof ProductSchema>;
