import { Inter, Poppins } from "next/font/google"

// Use Inter for body text (sans-serif) and Poppins for headings
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: true,
})

export const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  adjustFontFallback: true,
})
