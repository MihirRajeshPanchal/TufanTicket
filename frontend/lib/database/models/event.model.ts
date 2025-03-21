import { Document, Schema, model, models } from "mongoose";

// Keep the interface simple and match exactly what we need
export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  price: string;
  isFree: boolean;
  url: string;
  category: Schema.Types.ObjectId;
  organizer: Schema.Types.ObjectId;
  photos: { url: string }[];
}

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  imageUrl: { type: String, required: true },
  startDateTime: { type: Date, default: Date.now },
  endDateTime: { type: Date, default: Date.now },
  price: { type: String },
  isFree: { type: Boolean, default: false },
  url: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
  photos: [{
    url: { type: String, required: true }
  }]
}, {
  timestamps: true
})

const Event = models?.Event || model<IEvent>('Event', EventSchema);
export default Event;