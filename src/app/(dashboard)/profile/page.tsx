'use client'

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    branch: '',
    division: '',
  })

  const branches = [
    "Computer Engineering",
    "Information Technology Engineering",
    "Electronics and Telecommunication",
    "Mechanical Engineering",
    "Automation and Robotics Engineering"
  ]

  const divisions = ["A", "B"]

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setFormData({
            name: data.name || '',
            email: data.email || '',
            branch: data.branch || '',
            division: data.division || '',
          })
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Update session data
      await update()
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-2 border-black bg-[#F2EDE0]">
        <CardHeader className="border-b-2 border-black">
          <CardTitle className="text-2xl font-bold flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={session?.user?.image || "/images/default-avatar.png"}
                alt={session?.user?.name || "User"}
              />
              <AvatarFallback>{formData.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl">{formData.name}</h1>
              <p className="text-sm text-gray-500">{formData.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  name="name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                  name="email"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium">Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Division</label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                >
                  <option value="">Select Division</option>
                  {divisions.map((division) => (
                    <option key={division} value={division}>
                      Division {division}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Branch</p>
                  <p className="text-base font-medium">{formData.branch || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Division</p>
                  <p className="text-base font-medium">{formData.division ? `Division ${formData.division}` : 'Not set'}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}