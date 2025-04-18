import FrameworksTheoriesClientPage from "./FrameworksTheoriesClientPage"
import { Suspense } from 'react'

export const metadata = {
  title: "Frameworks & Theories | Global Pulse",
  description: "The scientific and theoretical foundations of the Global Pulse platform and its PCE engine",
}

export default function FrameworksTheoriesPage() {
  return (
    <Suspense fallback={<div>Loading frameworks...</div>}>
      <FrameworksTheoriesClientPage />
    </Suspense>
  )
}
