"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Building2, Plus, MoreVertical, Pencil, Trash2, Search, User, Loader2 } from 'lucide-react'
import { adminAPI, clientAPI } from '@/lib/api'
import { AdminData, Client } from '@/lib/types'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'react-toastify'

const AdminsPage = () => {
  const [admins, setAdmins] = useState<AdminData[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filteredAdmins, setFilteredAdmins] = useState<AdminData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = admins.filter(admin =>
        admin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getClientName(admin.clientId).toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredAdmins(filtered)
    } else {
      setFilteredAdmins(admins)
    }
  }, [searchQuery, admins])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [adminsResponse, clientsResponse] = await Promise.all([
        adminAPI.getAll(),
        clientAPI.getAll()
      ])
      
      const adminData = adminsResponse.data.data || []
      const clientData = clientsResponse.data.data || []
      
      setAdmins(adminData)
      setClients(clientData)
      setFilteredAdmins(adminData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch admins')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      await adminAPI.delete(id)
      toast.success('Admin deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('Failed to delete admin')
    }
  }

  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c._id === clientId)
    return client?.name || 'Unknown Client'
  }

  const getClientLogo = (clientId: string): string | undefined => {
    const client = clients.find(c => c._id === clientId)
    return client?.logo
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 w-full">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Loading admins...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Admin Management</h1>
            <p className="text-slate-600 mt-1">Manage client administrators</p>
          </div>
          <Link href="/admins/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Admin
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
                  placeholder="Search by name, email, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {filteredAdmins.length} Admins
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Admins Grid */}
        {filteredAdmins.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-medium">No admins found</p>
              <p className="text-slate-400 text-sm mt-1">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first admin'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdmins.map((admin) => (
              <Card key={admin._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-slate-200">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-semibold">
                          {getInitials(admin.firstName, admin.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-semibold text-slate-900">
                          {admin.firstName} {admin.lastName}
                        </CardTitle>
                        <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                          Admin
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
                          <Link href={`/admins/edit/${admin._id}`} className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(admin._id!, `${admin.firstName} ${admin.lastName}`)}
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
                      <span className="text-slate-700 truncate">{admin.email}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-700">{admin.phoneNumber}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <div className="flex items-center gap-2">
                        {getClientLogo(admin.clientId) && (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getClientLogo(admin.clientId)} alt="Client Logo" />
                            <AvatarFallback className="text-xs">
                              {getClientName(admin.clientId).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-slate-700 font-medium">{getClientName(admin.clientId)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Added {formatDate(admin.createdAt)}</span>
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
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

export default AdminsPage