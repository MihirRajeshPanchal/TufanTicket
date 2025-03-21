'use server'

import { revalidatePath } from 'next/cache'
import mongoose from 'mongoose'

import { connectToDatabase } from '@/lib/database'
import Event from '@/lib/database/models/event.model'
import User from '@/lib/database/models/user.model'
import Category from '@/lib/database/models/category.model'
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

// Function to handle Clerk to MongoDB ID mapping
const getUserByClerkId = async (clerkId: string) => {
  try {
    // Assuming you have a clerkId field in your User model
    const user = await User.findOne({ clerkId })
    if (!user) throw new Error('User not found')
    return user
  } catch (error) {
    handleError(error)
  }
}

// CREATE
export async function createEvent({ userId, event, path }: CreateEventParams) {
  try {
    await connectToDatabase()

    // Check if userId is a Clerk ID (not a MongoDB ObjectId)
    let organizer;
    if (userId && userId.startsWith('user_')) {
      // It's a Clerk ID, find the corresponding MongoDB user
      organizer = await getUserByClerkId(userId)
    } else {
      // Try to find as normal ObjectId
      organizer = await User.findById(userId)
    }

    if (!organizer) throw new Error('Organizer not found')

    const newEvent = await Event.create({ 
      ...event, 
      category: event.categoryId, 
      organizer: organizer._id // Use the MongoDB ObjectId
    })
    
    revalidatePath(path)

    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    handleError(error)
  }
}

// GET ONE EVENT BY ID
export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()

    const event = await Event.findById(eventId)
      .populate('organizer')
      .populate('category')
      .lean() // Convert to plain object

    if (!event) {
      throw new Error('Event not found')
    }

    // Ensure photos array exists
    const eventWithPhotos = {
      ...event,
      photos: !Array.isArray(event) && event.photos ? event.photos : []
    }

    return JSON.parse(JSON.stringify(eventWithPhotos))
  } catch (error) {
    console.error('Error fetching event:', error)
    throw error
  }
}

// UPDATE
export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()
    
    // Get the MongoDB user
    let organizer;
    if (userId && userId.startsWith('user_')) {
      organizer = await getUserByClerkId(userId)
      if (!organizer) throw new Error('User not found')
      userId = organizer._id.toString(); // Convert to string for comparison
    }

    const eventToUpdate = await Event.findById(event._id)
    if (!eventToUpdate) throw new Error('Event not found')
    
    // Compare the organizer IDs
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

// DELETE
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase()

    const deletedEvent = await Event.findByIdAndDelete(eventId)
    if (deletedEvent) revalidatePath(path)
  } catch (error) {
    handleError(error)
  }
}

// GET EVENTS BY ORGANIZER
export async function getEventsByUser({ userId, limit = 30, page }: GetEventsByUserParams) {
  try {
    await connectToDatabase()

    // Check if userId is undefined or null and handle accordingly
    if (!userId) {
      // Return empty data if userId is not provided
      return { data: [], totalPages: 0 }
    }

    let organizerId = userId;
    
    // If it's a Clerk ID, find the corresponding MongoDB user
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

// GET ALL EVENTS (unchanged)
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

// GET RELATED EVENTS (unchanged)
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

// Get photos for an event
export async function getEventPhotos(eventId: string) {
  try {
    await connectToDatabase()
    
    const event = await Event.findById(eventId).lean()
    return JSON.parse(JSON.stringify(Array.isArray(event) ? [] : event?.photos || []))
  } catch (error) {
    console.error('Error fetching event photos:', error)
    return []
  }
}

// Add photos to an event
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

    const result = await Event.findByIdAndUpdate(
      eventId,
      { 
        $push: { 
          photos: { url: photoUrl }
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    ).lean()

    revalidatePath(path)
    return JSON.parse(JSON.stringify(result))

  } catch (error) {
    console.error('Error saving photo:', error)
    throw error
  }
}