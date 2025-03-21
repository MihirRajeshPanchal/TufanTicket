import { Schema, model, models, Document } from 'mongoose';

interface IComment extends Document {
  eventId: Schema.Types.ObjectId;
  comments: Array<{
    userId: Schema.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
}

const CommentSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

const Comment = models?.Comment || model<IComment>('Comment', CommentSchema);
export default Comment; 