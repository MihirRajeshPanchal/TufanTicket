import CategoryFilter from "@/components/shared/CategoryFilter"
import Collection from "@/components/shared/Collection"
import Search from "@/components/shared/Search"
import { Button } from "@/components/ui/button"
import SidebarButton from "@/components/ui/chat"
import { getAllEvents } from "@/lib/actions/event.actions"
import { SearchParamProps } from "@/types"
import Image from "next/image"
import Link from "next/link"
import { auth } from "@clerk/nextjs"
import CustomButton from "@/components/shared/CustomButton"

export default async function Home({ searchParams }: SearchParamProps) {
	const page = Number(searchParams?.page) || 1
	const searchText = (searchParams?.query as string) || ""
	const category = (searchParams?.category as string) || ""
	const { userId } = auth()

	const events = await getAllEvents({
		query: searchText,
		category,
		page,
		limit: 100,
	})

	// Select random event from the fetched events
	const randomEvent = events?.data
		? events.data[Math.floor(Math.random() * events.data.length)]
		: null

	return (
		<>
			{!userId ? (
				<section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10">
					<div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-0">
						<div className="flex flex-col justify-center gap-8">
							<h1 className="h1-bold bg-gradient-to-r from-violet-500 to-purple-800 bg-clip-text text-transparent">
								Host, Connect, Celebrate: Your Events, Our
								Platform!
							</h1>
							<p className="p-regular-20 md:p-regular-24">
								Book and learn helpful tips from 3,168+ mentors
								in world-class companies with our global
								community.
							</p>
							<div className="flex flex-col gap-4 sm:flex-row">
								<Button
									size="lg"
									asChild
									className="button w-full sm:w-fit"
								>
									<Link href="#events">Explore Now</Link>
								</Button>
								<SidebarButton />
							</div>
						</div>

						<Image
							src="/assets/images/hero.png"
							alt="hero"
							width={1000}
							height={1000}
							className="max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]"
						/>
					</div>
				</section>
			) : (
				<section className="bg-gradient-to-b from-primary-50 to-white py-5 md:py-10 min-h-[600px] relative overflow-hidden">
					<div className="wrapper">
						<h2 className="h2-bold text-center mb-12 relative z-10 mix-blend-exclusion text-white">
							Featured For You
						</h2>

						{randomEvent && (
							<div className="relative w-full flex justify-center items-center min-h-[600px] outline">
								{/* Comet Effects */}
								<div className="absolute inset-0">
									{/* Green Comet */}
									<div className="absolute w-[3cm] h-[3cm] animate-comet-1">
										<div className="w-full h-full relative">
											<div
												className="absolute inset-0 rounded-full 
                                    bg-gradient-to-r from-green-500 via-green-300 to-transparent
                                    blur-[2px] animate-pulse-bright"
											/>
											<div
												className="absolute inset-0 rounded-full 
                                    bg-gradient-to-r from-green-400 via-green-200 to-transparent 
                                    blur-[4px] animate-pulse-bright"
											/>
											<div
												className="absolute h-1 w-12 -right-12 top-1/2 
                                    bg-gradient-to-r from-green-300 to-transparent 
                                    blur-[1px]"
											/>
										</div>
									</div>

									{/* Blue Comet */}
									<div className="absolute w-[3cm] h-[3cm] animate-comet-2">
										<div className="w-full h-full relative">
											<div
												className="absolute inset-0 rounded-full 
                                    bg-gradient-to-r from-blue-500 via-blue-300 to-transparent
                                    blur-[2px] animate-pulse-bright"
											/>
											<div
												className="absolute inset-0 rounded-full 
                                    bg-gradient-to-r from-blue-400 via-blue-200 to-transparent 
                                    blur-[4px] animate-pulse-bright"
											/>
											<div
												className="absolute h-1 w-12 -right-12 top-1/2 
                                    bg-gradient-to-r from-blue-300 to-transparent 
                                    blur-[1px]"
											/>
										</div>
									</div>

									{/* Orange Comet */}
									<div className="absolute w-[3cm] h-[3cm] animate-comet-3">
										<div className="w-full h-full relative">
											<div
												className="absolute inset-0 rounded-full 
                                    bg-gradient-to-r from-orange-500 via-orange-300 to-transparent
                                    blur-[2px] animate-pulse-bright"
											/>
											<div
												className="absolute inset-0 rounded-full 
                                    bg-gradient-to-r from-orange-400 via-orange-200 to-transparent 
                                    blur-[4px] animate-pulse-bright"
											/>
											<div
												className="absolute h-1 w-12 -right-12 top-1/2 
                                    bg-gradient-to-r from-orange-300 to-transparent 
                                    blur-[1px]"
											/>
										</div>
									</div>
								</div>

								{/* Featured Event Card */}
								<div
									className="relative z-10 w-[350px] bg-white/50 backdrop-blur rounded-2xl 
                              shadow-2xl p-6 transform ~hover:scale-105 transition-all duration-300
                              hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
								>
									<div className="relative h-[200px] w-full rounded-xl overflow-hidden">
										<Image
											src={randomEvent.imageUrl}
											alt={randomEvent.title}
											fill
											className="object-cover"
										/>
									</div>

									<div className="flex flex-col gap-4 mt-5">
										<h3
											className="h3-bold text-center line-clamp-1"
											title={randomEvent.title}
										>
											{randomEvent.title}
										</h3>

										<p
											className="p-regular-16 text-center text-gray-600 line-clamp-2"
											title={randomEvent.description}
										>
											{randomEvent.description}
										</p>

										<div className="flex flex-wrap gap-2 justify-center">
											<p className="px-4 py-2 rounded-full bg-primary-50/80 text-primary-500 text-sm font-medium">
												{randomEvent.isFree
													? "FREE"
													: `$${randomEvent.price}`}
											</p>
											{randomEvent.category?.name && (
												<p className="px-4 py-2 rounded-full bg-gray-50/80 text-gray-500 text-sm font-medium">
													{randomEvent.category.name}
												</p>
											)}
										</div>

										{/* <Button asChild className="w-full"> */}
										<Link
											href={`/events/${randomEvent._id}`}
										>
											<CustomButton
												content="View Details"
												className="py-1.5 font-medium"
											/>
										</Link>
										{/* </Button> */}
									</div>
								</div>
							</div>
						)}
					</div>
				</section>
			)}

			<section
				id="events"
				className="wrapper my-8 flex flex-col gap-8 md:gap-12"
			>
				<h2 className="h2-bold">
					Trust by <br /> Thousands of Events
				</h2>

				<div className="flex w-full flex-col gap-5 md:flex-row">
					<Search />
					<CategoryFilter />
				</div>

				<Collection
					data={events?.data}
					emptyTitle="No Events Found"
					emptyStateSubtext="Come back later"
					collectionType="All_Events"
					limit={6}
					page={page}
					totalPages={events?.totalPages}
				/>
			</section>
		</>
	)
}
