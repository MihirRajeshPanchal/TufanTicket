'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { addEventComment } from '@/lib/actions/event.actions'
import { usePathname } from 'next/navigation'

interface Comment {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    photo: string
  }
  text: string
  createdAt: string
  replyTo?: {
    userId: string
    name: string
  }
}

interface EventCommentsProps {
  eventId: string
  currentUser: {
    _id: string
    firstName: string
    lastName: string
    photo: string
  }
  comments: Comment[]
}

const EventComments = ({ eventId, currentUser, comments: initialComments }: EventCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || [])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<{ userId: string, name: string } | null>(null)
  const pathname = usePathname()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setIsSubmitting(true)
      const result = await addEventComment({
        eventId,
        userId: currentUser._id,
        text: newComment.trim(),
        replyTo: replyTo,
        path: pathname
      })

      if (result) {
        setComments(prevComments => [...prevComments, result.comments[result.comments.length - 1]])
        setNewComment('')
        setReplyTo(null)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = (userId: string, name: string) => {
    setReplyTo({ userId, name })
    setNewComment(`@${name} `)
  }

  const getImageUrl = (photoUrl: string) => {
    if (!photoUrl || photoUrl === '/assets/icons/profile-placeholder.svg') {
      return '/assets/icons/profile-placeholder.svg'
    }
    return photoUrl
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-semibold">All Discussions</h3>
      
      {/* Comment Form */}
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Image
            src={getImageUrl(currentUser.photo)}
            alt="Profile"
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
        </div>
        <form onSubmit={handleSubmitComment} className="flex-1">
          <div className="flex flex-col gap-2">
            {replyTo && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Replying to {replyTo.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null)
                    setNewComment('')
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-300"
              />
              <Button 
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {isSubmitting ? '...' : 'Reply'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="flex-shrink-0">
                <Image
                  src={getImageUrl(comment.userId.photo)}
                  alt="Profile"
                  width={36}
                  height={36}
                  className="rounded-full"
                  priority
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.userId.firstName} {comment.userId.lastName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-gray-600">
                  {comment.replyTo && (
                    <span className="text-gray-500">
                      @{comment.replyTo.name}{' '}
                    </span>
                  )}
                  {comment.text}
                </p>
                <button 
                  onClick={() => handleReply(comment.userId._id, `${comment.userId.firstName} ${comment.userId.lastName}`)}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Reply
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center">
            No comments yet. Start the discussion!
          </p>
        )}
      </div>
    </div>
  )
}

export default EventComments 