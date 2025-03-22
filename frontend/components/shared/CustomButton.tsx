import { cn } from "@/lib/utils"
import React, { HTMLAttributes } from "react"

export default function CustomButton({
	content,
	className,
	...props
}: { content: string } & HTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={cn(
				"w-full rounded-full overflow-clip relative isolate | before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-primary before:to-blue-400 before:[clip-path:circle(25%)] before:hover:[clip-path:circle(100%)] before:transition-[clip-path] before:duration-500",
				className
			)}
		>
			<span className="text-white">{content}</span>
		</button>
	)
}
