"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Loader2, Building2 } from 'lucide-react'
import Link from 'next/link'
import { adminAPI, clientAPI } from '@/lib/api'
import { AdminData, Client } from '@/lib/types'
import { toast } from 'react-toastify'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const EditAdminPage = () => {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState<Partial<AdminData>>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    clientId: '',
  })

  useEffect(() => {
    if (id) {
      fetchAdmin()
      fetchClients()
    }
  }, [id])

  const fetchAdmin = async () => {
    try {
      setIsLoading(true)
      const response = await adminAPI.getById(id)
      const admin = response.data.data
      setFormData(admin)
    } catch (error) {
      console.error('Error fetching admin:', error)
      toast.error('Failed to fetch admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      setIsLoadingClients(true)
      const response = await clientAPI.getAll()
      const clientData = response.data.data || []
      setClients(clientData)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch clients')
    } finally {
      setIsLoadingClients(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await adminAPI.update(id, formData)
      toast.success('Admin updated successfully!')
      router.push('/admins')
    } catch (error: any) {
      console.error('Error updating admin:', error)
      toast.error(error.response?.data?.message || 'Failed to update admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSelectedClient = () => {
    return clients.find(client => client._id === formData.clientId)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 w-full">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-600" />
          <p className="text-slate-600">Loading admin data...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admins">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Admin</h1>
            <p className="text-slate-600 mt-1">Update administrator information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Admin Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Client <span className="text-red-500">*</span>
                </label>
                {isLoadingClients ? (
                  <div className="flex items-center gap-2 p-4 border border-slate-300 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-slate-500">Loading clients...</span>
                  </div>
                ) : (
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name} - {client.city}, {client.state}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Client Preview */}
              {formData.clientId && getSelectedClient() && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getSelectedClient()?.logo} alt="Client Logo" />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getSelectedClient()?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">{getSelectedClient()?.name}</h3>
                      <p className="text-sm text-slate-600">
                        {getSelectedClient()?.city}, {getSelectedClient()?.state}
                      </p>
                      <p className="text-xs text-slate-500">{getSelectedClient()?.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoadingClients} 
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Admin...
                </>
              ) : (
                'Update Admin'
              )}
            </Button>
            <Link href="/admins" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

export default EditAdminPage