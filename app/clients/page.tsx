"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Calendar, Building2, Plus, MoreVertical, Pencil, Trash2, Search } from 'lucide-react'
import { clientAPI } from '@/lib/api'
import { Client } from '@/lib/types'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'react-toastify'

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [searchQuery, clients])

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await clientAPI.getAll()
      // API returns { success: true, data: [...] }
      const clientData = response.data.data || []
      setClients(clientData)
      setFilteredClients(clientData)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch clients')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      await clientAPI.delete(id)
      toast.success('Client deleted successfully')
      fetchClients()
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete client')
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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 w-full">
        <div className="text-center py-12">
          <p className="text-slate-600">Loading clients...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Clients Management</h1>
            <p className="text-slate-600 mt-1">Manage all your clients and their licenses</p>
          </div>
          <Link href="/clients/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {filteredClients.length} Clients
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-slate-500">No clients found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
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
                        <Badge variant={client.isLicenseActive ? "default" : "destructive"} className="mt-1">
                          {client.isLicenseActive ? "Active" : "Expired"}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/clients/edit/${client._id}`} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(client._id!, client.name)}
                          className="cursor-pointer text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-700 truncate">{client.email}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-700">+91 {client.phoneNumber}</span>
                    </div>

                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      <div className="text-slate-700">
                        <p className="font-medium">{client.city}, {client.state}</p>
                        <p className="text-slate-500 text-xs mt-1">{client.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(client.createdAt)}</span>
                      </div>
                      {client.licenseExpiryDate && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>Expires {formatDate(client.licenseExpiryDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default ClientsPage
