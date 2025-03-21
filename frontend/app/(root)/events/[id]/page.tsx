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

  return (
    <>
      <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl">
          <Image 
            src={event.imageUrl}
            alt="hero image"
            width={1000}
            height={1000}
            className="h-full min-h-[300px] object-cover object-center"
          />

          <div className="flex w-full flex-col gap-8 p-5 md:p-10">
            <div className="flex flex-col gap-6">
              <h2 className='h2-bold'>{event.title}</h2>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                    {event.isFree ? 'FREE' : `$${event.price}`}
                  </p>
                  <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                    {event.category.name}
                  </p>
                </div>

                <p className="p-medium-18 ml-2 mt-2 sm:mt-0">
                  by{' '}
                  <span className="text-primary-500">{event.organizer.firstName} {event.organizer.lastName}</span>
                </p>
              </div>
            </div>

            <CheckoutButton event={event} />

            <div className="flex flex-col gap-5">
              <div className='flex gap-2 md:gap-3'>
                <Image src="/assets/icons/calendar.svg" alt="calendar" width={32} height={32} />
                <div className="p-medium-16 lg:p-regular-20 flex flex-wrap items-center">
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

              <div className="p-regular-20 flex items-center gap-3">
                <Image src="/assets/icons/location.svg" alt="location" width={32} height={32} />
                <p className="p-medium-16 lg:p-regular-20">{event.location}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-grey-600">What You'll Learn:</p>
              <p className="p-medium-16 lg:p-regular-18">{event.description}</p>
              <p className="p-medium-16 lg:p-regular-18 truncate text-primary-500 underline">{event.url}</p>
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