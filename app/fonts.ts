import { Inter, Poppins } from "next/font/google"

// Optimize Inter as a variable font with better performance settings
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: true,
})

// Optimize Poppins as a variable font with better performance settings
export const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
  fallback: ["system-ui", "Helvetica", "Arial", "sans-serif"],
  adjustFontFallback: true,
})
