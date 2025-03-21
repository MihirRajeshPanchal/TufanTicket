"use client"
import {
    FacebookIcon,
    TwitterIcon,
    
} from "lucide-react"
import {
    WhatsappIcon,
    WhatsappShareButton
} from 'next-share'
import { useRef } from 'react';

interface ShareEventProps {
    eventId: string;
    title: string;
    description: string;
    image?: string;
}

export const ShareEvent = ({ eventId, title, description }: ShareEventProps) => {
    const shareUrlRef = useRef<string>(`${process.env.NEXT_PUBLIC_SERVER_URL}/events/${eventId}`);
    const text = encodeURIComponent(`${title} - ${description}`);

    const handleShare = (type: string) => {
        const shareUrl = encodeURIComponent(shareUrlRef.current);
        let url = "";

        if (type === 'facebook') {
            url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        } else if (type === 'twitter') {
            url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`;
        } else if (type === 'whatsapp') {
            url = `https://api.whatsapp.com/send?text=${text}%20${shareUrl}`;
        }

        if (url) window.open(url, '_blank');
    };

    return (
        <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
                <FacebookIcon size={24} onClick={() => handleShare('facebook')} className="cursor-pointer" />
                <TwitterIcon size={24} onClick={() => handleShare('twitter')} className="cursor-pointer" />
                <WhatsappShareButton
                    url={'https://github.com/next-share'}
                    title={'next-share is a social share buttons for your next React apps.'}
                    separator=":: "
                >
                    <WhatsappIcon size={32} round />
                </WhatsappShareButton>
            </div>
        </div>
    );
};
