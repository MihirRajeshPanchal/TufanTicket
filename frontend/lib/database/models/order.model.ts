import { Schema, model, models, Document } from 'mongoose'

export interface IOrder extends Document {
  createdAt: Date
  stripeId: string
  totalAmount: string
  event: {
    _id: string
    title: string
  }
  buyer: {
    _id: string
    firstName: string
    lastName: string
  }
}

export type IOrderItem = {
  _id: string
  totalAmount: string
  createdAt: Date
  eventTitle: string
  eventId: string
  buyer: string
}

const OrderSchema = new Schema({
  eventId: { type: String, required: true },
  buyerId: { type: String, required: true },
  totalAmount: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const Order = models?.Order || model('Order', OrderSchema)

export default Order
