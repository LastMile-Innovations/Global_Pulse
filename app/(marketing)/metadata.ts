import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Global Pulse | Real-Time Global Opinion & Insights",
  description:
    "Instantly see what the world thinks. Participate in AI-led conversations and surveys, explore live global sentiment, and add your voice to the Global Pulse.",
  keywords:
    "global opinion, real-time polling, AI chat, survey app, public sentiment, data insights, generative ui, world trends",
  openGraph: {
    title: "Global Pulse | Real-Time Global Opinion & Insights",
    description:
      "Instantly see what the world thinks. Participate in AI-led conversations and surveys, explore live global sentiment, and add your voice to the Global Pulse.",
    url: "https://globalpulse.app",
    siteName: "Global Pulse",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Global Pulse - Real-Time Global Opinion & Insights",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Pulse | Real-Time Global Opinion & Insights",
    description:
      "Instantly see what the world thinks. Participate in AI-led conversations and surveys, explore live global sentiment, and add your voice to the Global Pulse.",
    images: ["/twitter-image.jpg"],
    creator: "@globalpulseapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}
