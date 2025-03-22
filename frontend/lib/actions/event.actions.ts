'use server'

import { revalidatePath } from 'next/cache'
import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import Category from '@/lib/database/models/category.model'
import Comment from '@/lib/database/models/comment.model'
import { handleError } from '@/lib/utils'

import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types'

const getCategoryByName = async (name: string) => {
  return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

const populateEvent = (query: any) => {
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}


const getUserByClerkId = async (clerkId: string) => {
  try {
    
    const user = await User.findOne({ clerkId })
    if (!user) throw new Error('User not found')
    return user
  } catch (error) {
    handleError(error)
  }
}


export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDatabase()

    
    let organizer;
    if (userId && userId.startsWith('user_')) {
      
      organizer = await getUserByClerkId(userId)
    } else {
      
      organizer = await User.findById(userId)
    }

    if (!organizer) throw new Error('Organizer not found')

    const newEvent = await Event.create({ 
      ...event, 
      category: event.categoryId, 
      organizer: organizer._id 
    })
    
    revalidatePath(path)

    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    handleError(error)
  }
}


export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()

    const event = await Event.findById(eventId)
      .populate('organizer', '_id firstName lastName')
      .populate('category', '_id name')
      .lean()

    if (!event) {
      throw new Error('Event not found')
    }

    return JSON.parse(JSON.stringify({
      ...event,
      photos: event.photos || []
    }))
  } catch (error) {
    console.error('Error fetching event:', error)
    throw error
  }
}


export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()
    
    
    let organizer;
    if (userId && userId.startsWith('user_')) {
      organizer = await getUserByClerkId(userId)
      if (!organizer) throw new Error('User not found')
      userId = organizer._id.toString(); 
    }

    const eventToUpdate = await Event.findById(event._id)
    if (!eventToUpdate) throw new Error('Event not found')
    
    
    if (eventToUpdate.organizer.toString() !== userId) {
      throw new Error('Unauthorized: You are not the organizer of this event')
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    )
    revalidatePath(path)

    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    handleError(error)
  }
}


export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase()

    const deletedEvent = await Event.findByIdAndDelete(eventId)
    if (deletedEvent) revalidatePath(path)
  } catch (error) {
    handleError(error)
  }
}


export async function getEventsByUser({ userId, limit = 30, page }: GetEventsByUserParams) {
  try {
    await connectToDatabase()

    
    if (!userId) {
      
      return { data: [], totalPages: 0 }
    }

    let organizerId = userId;
    
    
    if (userId.startsWith('user_')) {
      const organizer = await getUserByClerkId(userId)
      if (!organizer) throw new Error('User not found')
      organizerId = organizer._id;
    }

    const conditions = { organizer: organizerId }
    const skipAmount = (page - 1) * limit

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}


export async function getAllEvents({ query, limit = 40, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase()

    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
    const categoryCondition = category ? await getCategoryByName(category) : null
    const conditions = {
      $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
    }

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}


export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}


export async function getEventPhotos(eventId: string) {
  try {
    await connectToDatabase()
    
    const eventPhotos = await EventPhoto.findOne({ eventId }).lean()
    console.log('Found event photos:', eventPhotos) 
    
    if (!eventPhotos) {
      return []
    }

    // Explicitly type the photo structure
    const photos = (event.photos as { url: string }[]).map(photo => photo.url)
    return JSON.parse(JSON.stringify(photos))
  } catch (error) {
    console.error('Error fetching photos:', error)
    return []
  }
}


export async function addEventPhotos({
  eventId,
  photoUrl,
  path
}: {
  eventId: string
  photoUrl: string
  path: string
}) {
  try {
    await connectToDatabase()

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { 
        $push: { 
          photos: { url: photoUrl }
        }
      },
      { new: true }
    ).lean()

    if (!updatedEvent) {
      throw new Error('Event not found')
    }

    revalidatePath(path)
    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    console.error('Error adding photo:', error)
    throw error
  }
}

export async function getEventComments(eventId: string) {
  try {
    await connectToDatabase()
    
    const comments = await Comment.findOne({ eventId })
      .populate({
        path: 'comments.userId',
        model: User,
        select: '_id firstName lastName username photo clerkId'
      })
      .lean()
    
    if (!commentDoc?.comments) {
      return []
    }

    const formattedComments = commentDoc.comments.map((comment: any) => ({
      _id: comment._id.toString(),
      text: comment.text,
      createdAt: comment.createdAt,
      userId: {
        _id: comment.userId._id.toString(),
        firstName: comment.userId.firstName || '',
        lastName: comment.userId.lastName || '',
        photo: comment.userId.photo || '/assets/icons/profile-placeholder.svg',
        username: comment.userId.username || ''
      }
    }))

    return formattedComments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export async function addEventComment({
  eventId,
  userId,
  text,
  path
}: {
  eventId: string
  userId: string
  text: string
  path: string
}) {
  try {
    await connectToDatabase()

    
    const user = await User.findById(userId).lean() as { 
      _id: mongoose.Types.ObjectId, 
      firstName: string, 
      lastName: string, 
      username: string, 
      photo?: string 
    } | null
    if (!user) throw new Error('User not found')

    const result = await Comment.findOneAndUpdate(
      { eventId },
      { 
        $push: { 
          comments: {
            userId,
            text,
            createdAt: new Date()
          }
        }
      },
      { 
        upsert: true, 
        new: true 
      }
    )
    .populate({
      path: 'comments.userId',
      model: User,
      select: '_id firstName lastName username photo'
    })
    .lean()

    if (!result) {
      throw new Error('Failed to add comment')
    }

    const newComment = result.comments[result.comments.length - 1]
    const formattedComment = {
      _id: newComment._id.toString(),
      text: newComment.text,
      createdAt: newComment.createdAt,
      userId: {
        _id: user._id.toString(),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        photo: user.photo || '/assets/icons/profile-placeholder.svg',
        username: user.username || ''
      }
    }

    revalidatePath(path)
    return { comment: formattedComment }
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}