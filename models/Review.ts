import { Model, Schema, SchemaDefinitionProperty, model } from "mongoose";

export interface IReview {
  _id: Schema.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
}

export interface ReviewModel extends Model<IReview> {
  calculateAvgAndRating(productId: Schema.Types.ObjectId): Promise<void>;
}

export const ReviewSchema = new Schema<IReview, ReviewModel>(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide a rating"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      required: [true, "Please provide a review title"],
    },
    comment: { type: String, required: [true, "Please provide review text"] },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAvgAndRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        numberOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  await model("Product").findOneAndUpdate(
    { _id: productId },
    {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numberOfReviews: result[0]?.numberOfReviews || 0,
    }
  );
};

//You have to do this to replace this.constructor.calculateAvgAndRating in plain javascript
ReviewSchema.post("save", async function () {
  const rm = this.constructor as ReviewModel;
  await rm.calculateAvgAndRating(this.product);
});
ReviewSchema.post("remove", async function (doc) {
  const rm = this.model as any as ReviewModel;
  await rm.calculateAvgAndRating(doc.product);
});
//---------------------------------------------------------------------------------------
export const Review = model<IReview, ReviewModel>("Review", ReviewSchema);
