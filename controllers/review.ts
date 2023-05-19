import { Request, Response } from "express";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import * as CustomError from "../errors";
import { StatusCodes } from "http-status-codes";
import { checkPermissions } from "../utils/checkPermissions";

export class ReviewController {
  constructor() {}

  //----------------------------------------------------------------
  async getAllReviews(req: Request, res: Response) {
    const reviews = await Review.find({}).populate({
      path: "product",
      select: "name company price",
    });
    //   .populate({
    //     path: "user",
    //     select: "name",
    //   });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
  }

  //----------------------------------------------------------------
  async createReview(req: Request, res: Response) {
    const { product: productId } = req.body;

    const isProductValid = await Product.findOne({ _id: productId });
    if (!isProductValid) {
      throw new CustomError.NotFoundError(
        `No product found with ID ${productId}`
      );
    }
    const alreadySubmitted = await Review.findOne({
      product: productId,
      user: req.user.userId,
    });
    if (alreadySubmitted) {
      throw new CustomError.BadRequestError(
        "Already submitted review for this product"
      );
    }
    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({ review });
  }

  //----------------------------------------------------------------
  async getSingleReview(req: Request, res: Response) {
    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
      throw new CustomError.NotFoundError(`No review found for ${reviewId}`);
    }
    res.status(StatusCodes.OK).json({ review });
  }

  //----------------------------------------------------------------
  async updateReview(req: Request, res: Response) {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;
    if (!rating || !title || !comment) {
      throw new CustomError.BadRequestError("Please provide all fileds");
    }
    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
      throw new CustomError.NotFoundError(`No review found for ${reviewId}`);
    }
    checkPermissions(req.user, review.user);
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
    res.status(StatusCodes.OK).json({ review });
  }

  //----------------------------------------------------------------
  async deleteReview(req: Request, res: Response) {
    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId });
    if (!review) {
      throw new CustomError.NotFoundError(`No review found for ${reviewId}`);
    }
    checkPermissions(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).send();
  }

  async getSingleProductReviews(req: Request, res: Response) {
    const { id: productId } = req.params;
    const reviews = await Review.find({ product: productId });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
  }
}
