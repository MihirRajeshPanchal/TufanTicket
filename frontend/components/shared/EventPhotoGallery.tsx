'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useUploadThing } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'
import { FileUploader } from './FileUploader'
import { addEventPhotos } from '@/lib/actions/event.actions'
import { usePathname } from 'next/navigation'

interface EventPhotoGalleryProps {
  eventId: string
  photos: string[]
}

const EventPhotoGallery = ({ eventId, photos: initialPhotos }: EventPhotoGalleryProps) => {
  const [photos, setPhotos] = useState<string[]>(initialPhotos || [])
  const [files, setFiles] = useState<File[]>([])
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const { startUpload } = useUploadThing('imageUploader')
  const pathname = usePathname()

  useEffect(() => {
    console.log('Initial photos in gallery:', initialPhotos)
    setPhotos(initialPhotos || [])
  }, [initialPhotos])

  // Infinite scroll handler
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      if (scrollWidth - (scrollLeft + clientWidth) < 20 && hasMore && !isUploading) {
        setPage(prev => prev + 1)
      }
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [hasMore, isUploading])

  const handleAddPhotos = async () => {
    if (files.length > 0) {
      try {
        setIsUploading(true)
        setMessage('Uploading photos, please wait...')
        
        const uploadedImages = await startUpload(files)
        if (!uploadedImages) {
          setMessage('Upload failed. Please try again.')
          return
        }

        // Save each uploaded image
        for (const image of uploadedImages) {
          try {
            console.log('Uploading image:', image.url)
            const res = await addEventPhotos({
              eventId,
              photoUrl: image.url,
              path: pathname
            })

            if (res) {
              setPhotos(prev => [...prev, image.url])
              setMessage('Photo uploaded successfully!')
            }
          } catch (error) {
            console.error('Error saving to database:', error)
            setMessage('Error saving photo. Please try again.')
          }
        }

        setFiles([])
      } catch (error) {
        console.error('Error in upload process:', error)
        setMessage('Error uploading photos. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <h3 className="h3-bold">Event Gallery</h3>
        <div className="flex items-start gap-8">
          <div className="w-[200px]">
            <FileUploader
              imageUrl=""
              onFieldChange={() => setMessage('Image selected! Click "Add Photos" to upload.')}
              setFiles={setFiles}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleAddPhotos}
              size="lg" 
              className="button"
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? 'Uploading...' : 'Add Photos'}
            </Button>
            {message && (
              <p className={`text-sm ${
                message.includes('Error') 
                  ? 'text-red-500' 
                  : message.includes('uploading') 
                    ? 'text-yellow-500' 
                    : 'text-green-600'
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <button 
          onClick={() => containerRef.current?.scrollBy(-200, 0)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div 
          ref={containerRef}
          className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide scroll-smooth px-4"
        >
          {photos && photos.length > 0 ? (
            photos.map((photoUrl, index) => (
              <div 
                key={index}
                className="flex-shrink-0 relative w-[200px] h-[200px] rounded-2xl overflow-hidden bg-grey-50"
              >
                <Image
                  src={photoUrl}
                  alt={`Event photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No photos added yet</p>
          )}
        </div>

        <button 
          onClick={() => containerRef.current?.scrollBy(200, 0)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default EventPhotoGallery 