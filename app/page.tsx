"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, TrendingUp, Calendar, Building2, AlertCircle } from 'lucide-react'
import { clientAPI } from '@/lib/api'
import { Client } from '@/lib/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const Page = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    expiredLicenses: 0,
    expiringThisMonth: 0,
  })
  const [recentClients, setRecentClients] = useState<Client[]>([])
  const [expiringClients, setExpiringClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await clientAPI.getAll()
      // API returns { success: true, data: [...] }
      const clients: Client[] = response.data.data || []

      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const active = clients.filter(c => c.isLicenseActive)
      const expired = clients.filter(c => !c.isLicenseActive)
      const expiring = clients.filter(c => {
        if (!c.licenseExpiryDate) return false
        const expiryDate = new Date(c.licenseExpiryDate)
        return expiryDate > now && expiryDate <= thirtyDaysFromNow
      })

      setStats({
        totalClients: clients.length,
        activeClients: active.length,
        expiredLicenses: expired.length,
        expiringThisMonth: expiring.length,
      })

      setRecentClients(clients.slice(0, 5))
      setExpiringClients(expiring.slice(0, 5))
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      
      // Show user-friendly error message
      const errorMessage = error.userMessage || error.message || 'Failed to fetch dashboard data'
      
      // You can show a toast notification here if you want
      // toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage all clients and monitor system activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalClients}</div>
              <p className="text-xs opacity-80 mt-1">All registered clients</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
              <UserCheck className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeClients}</div>
              <p className="text-xs opacity-80 mt-1">Currently active</p>
            </CardContent>
          </Card> 

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expired Licenses</CardTitle>
              <UserX className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.expiredLicenses}</div>
              <p className="text-xs opacity-80 mt-1">Need renewal</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertCircle className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.expiringThisMonth}</div>
              <p className="text-xs opacity-80 mt-1">Within 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Clients & Expiring Licenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Recent Clients</CardTitle>
                <Link href="/clients">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClients.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No clients yet</p>
                ) : (
                  recentClients.map((client) => (
                    <div key={client._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.logo} alt={client.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{client.name}</p>
                        <p className="text-sm text-slate-500 truncate">{client.email}</p>
                      </div>
                      <Badge variant={client.isLicenseActive ? "default" : "destructive"}>
                        {client.isLicenseActive ? "Active" : "Expired"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expiring Licenses */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Expiring Licenses</CardTitle>
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expiringClients.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No licenses expiring soon</p>
                ) : (
                  expiringClients.map((client) => (
                    <div key={client._id} className="flex items-center gap-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.logo} alt={client.name} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{client.name}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {formatDate(client.licenseExpiryDate)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/clients">
                <Button className="w-full h-20 text-lg" variant="outline">
                  <Users className="mr-2 h-5 w-5" />
                  Manage Clients
                </Button>
              </Link>
              <Link href="/clients/new">
                <Button className="w-full h-20 text-lg" variant="outline">
                  <Building2 className="mr-2 h-5 w-5" />
                  Add New Client
                </Button>
              </Link>
              <Link href="/licenses">
                <Button className="w-full h-20 text-lg" variant="outline">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  License Management
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default Page