import { Router } from "express";
import { OrderController } from "../controllers/order";
import { authenticateUser } from "../middleware/authentication";
import { authorizePermissions } from "../middleware/authentication";

const oc = new OrderController();
const router = Router();

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), oc.getAllOrders)
  .post(authenticateUser, oc.createOrder);

router.route("/showAllMyOrders").get(authenticateUser, oc.getCurrentUserOrders);

router
  .route("/:id")
  .get(authenticateUser, oc.getSingleOrder)
  .patch(authenticateUser, oc.UpdateOrder);

export default router;
