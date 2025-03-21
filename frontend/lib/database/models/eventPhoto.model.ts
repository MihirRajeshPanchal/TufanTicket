import { Schema, model, models } from 'mongoose';

const EventPhotoSchema = new Schema({
  eventId: { 
    type: Schema.Types.ObjectId,
    required: true 
  },
  photos: [String]  // Simple array of photo URLs
});

// Use the existing collection name 'events_photo'
const EventPhoto = models?.EventPhoto || model('EventPhoto', EventPhotoSchema, 'events_photo');

export default EventPhoto; 