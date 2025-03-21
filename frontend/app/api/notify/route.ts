import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { connectToDatabase } from "@/lib/database"; // Ensure you have a DB connection utility
import User from "@/lib/database/models/user.model"; // Adjust this path to match your user model




// Use Node.js runtime
export const runtime = "nodejs";

function formatTime(dateString: string): string {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function formatPrice(price: string | number): string {
    if (!price) return "TBA";

    const number = parseFloat(price.toString());
    if (isNaN(number)) return price.toString();

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(number);
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log(body)

        if (!body || !body.newEvent) {
            return NextResponse.json({ success: false, message: "Invalid request data" }, { status: 400 });
        }

        const { newEvent } = body;
        const { title, date, time, description, location, imageUrl, startDateTime, endDateTime, price, isFree, url, category,organizer } = newEvent;

        // Connect to the database
        await connectToDatabase();

        // Fetch all user emails
        const users = await User.find({}, "email");
        const recipientEmails = users.map((user: { email: string }) => user.email);

        if (recipientEmails.length === 0) {
            return NextResponse.json({ success: false, message: "No users found." }, { status: 400 });
        }

        console.log(users);

        // Configure the transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD,
            },
            
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL,
            to: "", // Will be filled dynamically in batch processing
            subject: `Update: ${title}`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title} - Event Details</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                    color: #333;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background-color: #1a2b22;
                    color: white;
                    text-align: center;
                    padding: 40px 20px;
                    position: relative;
                }
                .header h1 {
                    font-size: 36px;
                    margin: 0;
                    color: #4dff91;
                }
                .header h2 {
                    font-size: 20px;
                    margin: 10px 0 0;
                }
                .header::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('${imageUrl || "/api/placeholder/800/400"}') center/cover;
                    z-index: -1;
                }
                .details {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    margin-top: -20px;
                }
                .details h3 {
                    margin-top: 0;
                }
                .details p {
                    margin: 10px 0;
                }
                .badge {
                    display: inline-block;
                    padding: 5px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    margin-right: 5px;
                }
                .badge-free {
                    background-color: #e0ffea;
                    color: #0d7a3e;
                }
                .badge-category {
                    background-color: #f0f0f0;
                    color: #666;
                }
                .button {
                    display: inline-block;
                    background-color: #2e7d32;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    text-decoration: none;
                    font-size: 16px;
                    margin-top: 20px;
                }
                .button:hover {
                    background-color: #1b5e20;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #777;
                }
                </style>
            </head>
            <body>
                <div class="header">
                <h1>${title}</h1>
                <h2>${description || "Event Details"}</h2>
                <div>
                    ${isFree ? '<span class="badge badge-free">FREE</span>' : ''}
                    <span class="badge badge-category">${category || "Event"}</span>
                </div>
                </div>
                <div class="container">
                <div class="details">
                    <h3>Event Details</h3>
                    <p><strong>Date:</strong> ${new Date(startDateTime).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                    })}</p>
                    <p><strong>Time:</strong> ${formatTime(startDateTime)} ${endDateTime ? '- ' + formatTime(endDateTime) : ''}</p>
                    <p><strong>Location:</strong> ${location || "TBA"}</p>
                    <p><strong>Price:</strong> ${isFree ? 'FREE' : price ? formatPrice(price) : 'TBA'}</p>
                    <p>${description || "No additional details available."}</p>
                    <a href="${url || "#"}" class="button">Register Now</a>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} ${title}. All rights reserved.</p>
                </div>
                </div>
            </body>
            </html>
            `,
        };
        const failedEmails: string[] = [];
        for (const email of recipientEmails) {
            mailOptions.to = email;
            try {
            await transporter.sendMail(mailOptions);
            console.log("Mail sent to:", email);
            } catch (error) {
            console.error("Failed to send mail to:", email, error);
            failedEmails.push(email);
            }
        }

        if (failedEmails.length > 0) {
            console.warn("Failed to send emails to the following addresses:", failedEmails);
        }

        return NextResponse.json({ success: true, message: "Emails sent successfully." });
    } catch (error) {
        console.error("Error sending emails: ", error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
