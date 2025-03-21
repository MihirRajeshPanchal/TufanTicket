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
  const containerRef = useRef<HTMLDivElement>(null)
  const { startUpload } = useUploadThing('imageUploader')
  const pathname = usePathname()

  useEffect(() => {
    console.log('Initial photos in gallery:', initialPhotos)
    setPhotos(initialPhotos || [])
  }, [initialPhotos])

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
        <h3 className="text-4xl font-bold">Event Gallery</h3>
        <div className="flex items-start gap-8">
          <div className="w-[280px] h-[280px] bg-gray-50 rounded-lg">
            <FileUploader
              imageUrl=""
              onFieldChange={(e) => {
                const files = e.target.files
                if (files && files.length > 0) {
                  setFiles(Array.from(files))
                  setMessage('Image selected! Click "Add Photos" to upload.')
                }
              }}
              setFiles={setFiles}
            />
          </div>
          <Button 
            onClick={handleAddPhotos}
            size="lg" 
            className="bg-[#8645FF] hover:bg-[#7835FF] text-white px-8 py-3 rounded-full"
            disabled={isUploading || files.length === 0}
          >
            {isUploading ? 'Uploading...' : 'Add Photos'}
          </Button>
        </div>
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

      {/* Photos Display */}
      <div className="relative w-full">
        <button 
          onClick={() => containerRef.current?.scrollBy(-280, 0)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
          style={{ display: photos.length > 0 ? 'block' : 'none' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div 
          ref={containerRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth px-4"
        >
          {photos && photos.length > 0 ? (
            photos.map((photoUrl, index) => (
              <div 
                key={index}
                className="flex-shrink-0 relative w-[280px] h-[280px] rounded-lg overflow-hidden bg-gray-50"
              >
                <Image
                  src={photoUrl}
                  alt={`Event photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 280px) 100vw, 280px"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No photos added yet</p>
          )}
        </div>

        <button 
          onClick={() => containerRef.current?.scrollBy(280, 0)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2"
          style={{ display: photos.length > 0 ? 'block' : 'none' }}
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