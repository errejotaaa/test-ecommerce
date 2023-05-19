import { Router } from "express";
import { ProductController } from "../controllers/product";
import { authenticateUser } from "../middleware/authentication";
import { authorizePermissions } from "../middleware/authentication";
import { ReviewController } from "../controllers/review";

const reviewCtrlr = new ReviewController();
const productCtlr = new ProductController();
export const productRouter = Router();

productRouter
  .route("/")
  .post(
    authenticateUser,
    authorizePermissions("admin"),
    productCtlr.createProduct
  )
  .get(productCtlr.getAllProducts);

productRouter
  .route("/uploadImage")
  .post(
    authenticateUser,
    authorizePermissions("admin"),
    productCtlr.uploadImage
  );

productRouter
  .route("/:id")
  .get(productCtlr.getSingleProduct)
  .patch(
    authenticateUser,
    authorizePermissions("admin"),
    productCtlr.updateProduct
  )
  .delete(
    authenticateUser,
    authorizePermissions("admin"),
    productCtlr.deleteProduct
  );

productRouter.route("/:id/reviews").get(reviewCtrlr.getSingleProductReviews);
