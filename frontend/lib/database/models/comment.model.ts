import { Schema, model, models } from "mongoose";

const CommentSchema = new Schema({
  eventId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  comments: [{
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    text: { 
      type: String, 
      required: true 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
})

const Comment = models?.Comment || model('Comment', CommentSchema);
export default Comment; 