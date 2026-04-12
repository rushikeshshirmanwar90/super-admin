"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { clientAPI } from '@/lib/api'
import { Client } from '@/lib/types'
import { toast } from 'react-toastify'

const LicensesPage = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'expiring'>('all')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await clientAPI.getAll()
      // API returns { success: true, data: [...] }
      const clientData = response.data.data || []
      setClients(clientData)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch license data')
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredClients = () => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    switch (filter) {
      case 'active':
        return clients.filter(c => c.isLicenseActive)
      case 'expired':
        return clients.filter(c => !c.isLicenseActive)
      case 'expiring':
        return clients.filter(c => {
          if (!c.licenseExpiryDate) return false
          const expiryDate = new Date(c.licenseExpiryDate)
          return expiryDate > now && expiryDate <= thirtyDaysFromNow
        })
      default:
        return clients
    }
  }

  const getDaysRemaining = (expiryDate: string | Date | undefined) => {
    if (!expiryDate) return null
    const now = new Date()
    const expiry = new Date(expiryDate)
    const diff = expiry.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
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

  const filteredClients = getFilteredClients()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 w-full">
        <div className="text-center py-12">
          <p className="text-slate-600">Loading license data...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">License Management</h1>
            <p className="text-slate-600 mt-1">Monitor and manage client licenses</p>
          </div>
          <Button onClick={fetchClients} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="gap-2"
              >
                All Licenses ({clients.length})
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => setFilter('active')}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Active ({clients.filter(c => c.isLicenseActive).length})
              </Button>
              <Button
                variant={filter === 'expired' ? 'default' : 'outline'}
                onClick={() => setFilter('expired')}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Expired ({clients.filter(c => !c.isLicenseActive).length})
              </Button>
              <Button
                variant={filter === 'expiring' ? 'default' : 'outline'}
                onClick={() => setFilter('expiring')}
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Expiring Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* License Cards */}
        {filteredClients.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No licenses found for this filter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => {
              const daysRemaining = getDaysRemaining(client.licenseExpiryDate)
              const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0
              const isExpired = !client.isLicenseActive || (daysRemaining !== null && daysRemaining <= 0)

              return (
                <Card
                  key={client._id}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-orange-50' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-slate-200">
                          <AvatarImage src={client.logo} alt={client.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {getInitials(client.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-900">{client.name}</CardTitle>
                          <p className="text-sm text-slate-500">{client.email}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Status</span>
                        <Badge variant={isExpired ? 'destructive' : isExpiringSoon ? 'default' : 'default'}>
                          {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
                        </Badge>
                      </div>

                      {client.licenseExpiryDate && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Expiry Date</span>
                            <span className="font-medium text-slate-900 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(client.licenseExpiryDate)}
                            </span>
                          </div>

                          {daysRemaining !== null && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Days Remaining</span>
                              <span
                                className={`font-bold ${
                                  daysRemaining <= 0
                                    ? 'text-red-600'
                                    : daysRemaining <= 30
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                }`}
                              >
                                {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days`}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">License Days</span>
                        <span className="font-medium text-slate-900">{client.license || 0} days</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <Button variant="outline" className="w-full" size="sm">
                        Renew License
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default LicensesPage
