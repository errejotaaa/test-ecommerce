import { ISingleOrderItem } from "./../models/Order";
import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { StatusCodes } from "http-status-codes";
import * as CustomError from "../errors";
import { checkPermissions } from "../utils/checkPermissions";
import { Schema } from "mongoose";

interface IOrderItem extends ISingleOrderItem {
  amount: number;
  product: Schema.Types.ObjectId;
}
interface IPaymentIntent {
  amount: number;
  currency: string;
}
const fakeStripeAPI = async ({ amount, currency }: IPaymentIntent) => {
  const client_secret = "some random value";
  return { client_secret, amount };
};

export class OrderController {
  constructor() {}

  //----------------------------------------------------------------

  async getAllOrders(req: Request, res: Response) {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
  }

  //----------------------------------------------------------------

  async createOrder(req: Request, res: Response) {
    const {
      items: cartItems,
      tax,
      shippingFee,
    }: {
      items: ISingleOrderItem[];
      tax: number;
      shippingFee: number;
    } = req.body;

    if (!cartItems || cartItems.length < 1) {
      throw new CustomError.BadRequestError("No cart Items provided");
    }
    if (!tax || !shippingFee) {
      throw new CustomError.BadRequestError(
        "Please provide tax and shipping fee"
      );
    }

    let orderItems: IOrderItem[] = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const dbProduct = await Product.findOne({ _id: item.product });
      if (!dbProduct) {
        throw new CustomError.NotFoundError(
          `No Product found with id ${item.product}`
        );
      }
      const { name, price, image, _id } = dbProduct;
      const singleOrderItem: IOrderItem = {
        amount: item.amount,
        name,
        price,
        image,
        product: _id,
      };

      //add item to order
      orderItems = [...orderItems, singleOrderItem];

      //calculate subtotal
      subtotal += item.amount * price;

      console.log(orderItems, subtotal);
    }
    //calculate total
    const total = tax + shippingFee + subtotal;

    //get client secret
    const paymentIntent = await fakeStripeAPI({
      amount: total,
      currency: "usd",
    });

    const order = await Order.create({
      orderItems,
      total,
      subtotal,
      tax,
      shippingFee,
      clientSecret: paymentIntent.client_secret,
      user: req.user.userId,
    });
    res
      .status(StatusCodes.CREATED)
      .json({ order, clientSecret: order.clientSecret });
  }

  //----------------------------------------------------------------

  async getSingleOrder(req: Request, res: Response) {
    const { id: orderId } = req.params;
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      throw new CustomError.NotFoundError(`No Order found for id ${orderId}`);
    }
    checkPermissions(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
  }

  //----------------------------------------------------------------

  async getCurrentUserOrders(req: Request, res: Response) {
    const orders = await Order.find({ user: req.user.userId });
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
  }

  //----------------------------------------------------------------

  async UpdateOrder(req: Request, res: Response) {
    const { id: orderId } = req.params;
    const { paymentIntentId }: { paymentIntentId: string } = req.body;

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      throw new CustomError.NotFoundError(`No Order found for id ${orderId}`);
    }
    checkPermissions(req.user, order.user);
    order.paymentIntentId = paymentIntentId;
    order.status = "paid";
    order.save();
    res.status(StatusCodes.OK).json({ order });
  }
}
