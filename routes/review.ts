import { Router } from "express";
import { ReviewController } from "../controllers/review";
import { authenticateUser } from "../middleware/authentication";

const reviewCtrlr = new ReviewController();

const router = Router();

router
  .route("/")
  .get(reviewCtrlr.getAllReviews)
  .post(authenticateUser, reviewCtrlr.createReview);

router
  .route("/:id")
  .get(reviewCtrlr.getSingleReview)
  .patch(authenticateUser, reviewCtrlr.updateReview)
  .delete(authenticateUser, reviewCtrlr.deleteReview);

export default router;
