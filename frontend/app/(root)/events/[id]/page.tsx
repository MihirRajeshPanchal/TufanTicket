import CheckoutButton from '@/components/shared/CheckoutButton';
import Collection from '@/components/shared/Collection';
import { getEventById, getRelatedEventsByCategory, getEventPhotos, getEventComments } from '@/lib/actions/event.actions'
import { formatDateTime } from '@/lib/utils';
import { SearchParamProps } from '@/types'
import Image from 'next/image';
import EventPhotoGallery from '@/components/shared/EventPhotoGallery'
import EventComments from '@/components/shared/EventComments'
import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.actions";
import { getEventParticipantsCount } from '@/lib/actions/order.actions'

const EventDetails = async ({ params: { id }, searchParams }: SearchParamProps) => {
  const { userId } = auth();
  
  // Get event and other data
  const event = await getEventById(id);
  const photos = await getEventPhotos(id);
  const comments = await getEventComments(id);
  
  // Get current user data with error handling
  let currentUser = null;
  if (userId) {
    try {
      currentUser = await getUserById(userId);
      console.log('Current user data:', currentUser); // Debug log
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  console.log('Fetched photos for event:', photos) // Debug log

  const relatedEvents = await getRelatedEventsByCategory({
    categoryId: event.category._id,
    eventId: event._id,
    page: searchParams.page as string,
  })

  // Ensure photos array exists
  const eventPhotos = photos || []

  // Get participants count
  const participantsCount = await getEventParticipantsCount(id);

  return (
    <>
      <section className="flex justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image Container */}
              <div className="relative p-4 flex flex-col">
                <div className="relative h-[400px] w-full rounded-xl overflow-hidden border-8 border-white shadow-inner">
                  <Image 
                    src={event.imageUrl}
                    alt="hero image"
                    fill
                    className="object-cover object-center hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Participants Count Section */}
                <div className="mt-4 p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative flex -space-x-2">
                        {/* Sample avatar stack - you can make this dynamic if you have participant avatars */}
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-8 h-8 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ))}
                        {participantsCount > 3 && (
                          <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-primary-500 font-medium">
                              +{participantsCount - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {participantsCount} {participantsCount === 1 ? 'Participant' : 'Participants'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Have registered for this event
                        </p>
                      </div>
                    </div>
                    
                    {/* Live Indicator */}
                    <div className="flex items-center gap-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-medium text-green-600">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Container */}
              <div className="flex flex-col gap-6 p-6 md:p-8 bg-white">
                <div className="flex flex-col gap-4">
                  <h2 className='text-3xl font-bold text-gray-900'>{event.title}</h2>

                  <div className="flex flex-wrap gap-3">
                    <p className="px-5 py-2 rounded-full bg-green-500/10 text-green-700 font-semibold text-sm">
                      {event.isFree ? 'FREE' : `$${event.price}`}
                    </p>
                    <p className="px-4 py-2 rounded-full bg-primary-50 text-primary-500 font-semibold text-sm">
                      {event.category.name}
                    </p>
                  </div>

                  <p className="text-gray-600">
                    Organized by{' '}
                    <span className="text-primary-500 font-semibold">
                      {event.organizer.firstName} {event.organizer.lastName}
                    </span>
                  </p>
                </div>

                <CheckoutButton event={event} />

                <div className="flex flex-col gap-4 border-t pt-4">
                  <div className='flex items-start gap-3'>
                    <Image 
                      src="/assets/icons/calendar.svg" 
                      alt="calendar" 
                      width={24} 
                      height={24}
                      className="mt-1"
                    />
                    <div className="flex flex-col text-gray-600 text-sm">
                      <p>
                        {formatDateTime(event.startDateTime).dateOnly} - {' '}
                        {formatDateTime(event.startDateTime).timeOnly}
                      </p>
                      <p>
                        {formatDateTime(event.endDateTime).dateOnly} -  {' '}
                        {formatDateTime(event.endDateTime).timeOnly}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Image 
                      src="/assets/icons/location.svg" 
                      alt="location" 
                      width={24} 
                      height={24}
                      className="mt-1"
                    />
                    <p className="text-gray-600 text-sm">{event.location}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t pt-4">
                  <h3 className="font-semibold text-gray-900">About the Event:</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
                  {event.url && (
                    <a 
                      href={event.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary-500 text-sm hover:underline truncate"
                    >
                      {event.url}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery and Comments Sections Container */}
      <div className="wrapper my-8">
        {/* Photo Gallery Section */}
        <section className="mb-8">
          <EventPhotoGallery 
            eventId={event._id}
            photos={eventPhotos}
          />
        </section>

        {/* Related Events Section */}
        <section className="mb-8">
          <h2 className="h2-bold mb-6">Related Events</h2>
          <Collection 
            data={relatedEvents?.data}
            emptyTitle="No Events Found"
            emptyStateSubtext="Come back later"
            collectionType="All_Events"
            limit={3}
            page={searchParams.page as string}
            totalPages={relatedEvents?.totalPages}
          />
        </section>

        {/* Comments Section */}
        <section className="max-w-4xl">
          <div className="border rounded-xl">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-6">All Discussions</h3>
              
              {currentUser ? (
                <EventComments 
                  eventId={event._id}
                  currentUser={currentUser}
                  comments={comments}
                />
              ) : (
                <p className="text-gray-600 text-center">Please sign in to join the discussion.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default EventDetails