import { Request, Response } from "express";
import { Product } from "../models/Product";
import { StatusCodes } from "http-status-codes";
import * as CustomError from "../errors";
import fileUpload from "express-fileupload";
import path from "path";

export class ProductController {
  constructor() {}

  async createProduct(req: Request, res: Response) {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({ product });
  }

  async getAllProducts(req: Request, res: Response) {
    const products = await Product.find({});
    res.status(StatusCodes.OK).json({ products, count: products.length });
  }

  async getSingleProduct(req: Request, res: Response) {
    const { id: productId } = req.params;

    const product = await Product.findOne({ _id: productId }).populate({
      path: "reviews",
    });
    if (!product) {
      throw new CustomError.NotFoundError(
        `No product found with ID: ${productId}`
      );
    }
    res.status(StatusCodes.OK).json({ product });
  }

  async updateProduct(req: Request, res: Response) {
    const { id: productId } = req.params;
    const product = await Product.findOneAndUpdate(
      { _id: productId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new CustomError.NotFoundError(
        `No product found with id ${productId}`
      );
    }
    res.status(StatusCodes.OK).json(product);
  }

  async deleteProduct(req: Request, res: Response) {
    const { id: productId } = req.params;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      throw new CustomError.NotFoundError(
        `No product found with id ${productId}`
      );
    }
    await product.remove();
    res.status(StatusCodes.OK).send();
  }

  async uploadImage(req: Request, res: Response) {
    if (!req.files) {
      throw new CustomError.BadRequestError("No File uploaded");
    }

    const productImage = req.files.image as fileUpload.UploadedFile;
    if (!productImage.mimetype.startsWith("image")) {
      throw new CustomError.BadRequestError("Please upload an image");
    }
    const maxSise = 1024 * 1024;

    if (productImage.size > maxSise) {
      throw new CustomError.BadRequestError(
        "Please upload image smaller than 1MB"
      );
    }
    const imagePath = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      productImage.name
    );
    await productImage.mv(imagePath);
    res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
  }
}
