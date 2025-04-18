import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Admin Dashboard | Global Pulse",
  description: "Global Pulse Admin Dashboard",
}

export default function AdminPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Access Requests</CardTitle>
            <CardDescription>Manage data access requests from potential buyers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/buyer-intents">View Requests</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
