"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Calendar, Building2, Plus, MoreVertical, Pencil, Trash2, Search, Key, Loader2, User, UserPlus, Copy, Check } from 'lucide-react'
import { clientAPI, adminAPI } from '@/lib/api'
import { Client } from '@/lib/types'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // License management state
  const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [licenseAction, setLicenseAction] = useState<'add' | 'replace'>('add')
  const [licenseValue, setLicenseValue] = useState<number>(1)
  const [licenseUnit, setLicenseUnit] = useState<'days' | 'months' | 'years'>('days')
  const [isLifetime, setIsLifetime] = useState(false)
  const [isUpdatingLicense, setIsUpdatingLicense] = useState(false)

  // Add admin state
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const [adminFormData, setAdminFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  })
  const [emailVerificationStep, setEmailVerificationStep] = useState<'form' | 'verification' | 'verified'>('form')
  const [verificationCode, setVerificationCode] = useState('')
  const [sentVerificationCode, setSentVerificationCode] = useState('')
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)

  // View admins state - Simple and clean
  const [isViewAdminsDialogOpen, setIsViewAdminsDialogOpen] = useState(false)
  const [clientAdmins, setClientAdmins] = useState([]) // Simple array
  const [isLoadingClientAdmins, setIsLoadingClientAdmins] = useState(false)

  // Copy client ID state
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
      const [clientsResponse, adminsResponse] = await Promise.all([
        clientAPI.getAll(),
        adminAPI.getAll().catch(() => ({ data: { data: [] } })) // Handle if admin API doesn't exist yet
      ])
      
      // API returns { success: true, data: [...] }
      const clientData = clientsResponse.data.data || []
      const adminData = adminsResponse.data.data || []
      
      setClients(clientData)
      setAdmins(adminData)
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

  const handleCopyClientId = async (clientId: string) => {
    try {
      await navigator.clipboard.writeText(clientId)
      setCopiedId(clientId)
      toast.success('Client ID copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy client ID:', error)
      toast.error('Failed to copy client ID')
    }
  }

  const calculateLicenseDays = (value: number, unit: 'days' | 'months' | 'years'): number => {
    if (unit === 'months') return value * 31
    if (unit === 'years') return value * 365
    return value
  }

  const handleManageLicense = (client: Client) => {
    setSelectedClient(client)
    setLicenseAction('add')
    setLicenseValue(1)
    setLicenseUnit('days')
    setIsLifetime(client.license === -1)
    setIsLicenseDialogOpen(true)
  }

  const handleAddAdmin = (client: Client) => {
    setSelectedClient(client)
    setAdminFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
    })
    setEmailVerificationStep('form')
    setVerificationCode('')
    setSentVerificationCode('')
    setIsAddAdminDialogOpen(true)
  }

  const handleViewAdmins = (client: Client) => {
    console.log('🔍 Opening admin dialog for client:', client.name)
    setSelectedClient(client)
    setIsViewAdminsDialogOpen(true)
    
    // For now, let's just show mock data to test the dialog
    const mockAdmins = [
      {
        _id: 'mock-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '1234567890',
        clientId: client._id,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'mock-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phoneNumber: '0987654321',
        clientId: client._id,
        createdAt: new Date().toISOString()
      }
    ]
    
    setClientAdmins(mockAdmins)
    console.log('✅ Set mock admins:', mockAdmins)
  }

  const handleDeleteClientAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to delete ${adminName}?`)) return

    try {
      // Check if it's mock data
      if (adminId.startsWith('mock-')) {
        console.log('🧪 Deleting mock admin:', adminId)
        // Remove from local state for mock data
        setClientAdmins(prev => prev.filter(admin => admin._id !== adminId))
        toast.success('Mock admin deleted successfully')
        return
      }

      await adminAPI.delete(adminId)
      toast.success('Admin deleted successfully')
      // Refresh the admin list
      if (selectedClient) {
        handleViewAdmins(selectedClient)
      }
      // Also refresh the main client list to update admin counts
      fetchClients()
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('Failed to delete admin')
    }
  }

  const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAdminFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleSendVerification = async () => {
    if (!adminFormData.email) {
      toast.error('Please enter an email address')
      return
    }

    setIsSendingVerification(true)
    try {
      const code = generateVerificationCode()
      
      // Import and use the sendOtp function
      const { sendOtp } = await import('@/lib/functions/send-otp')
      const success = await sendOtp(adminFormData.email, parseInt(code))
      
      if (success) {
        setSentVerificationCode(code)
        toast.success(`Verification code sent to ${adminFormData.email}`)
        setEmailVerificationStep('verification')
      } else {
        toast.error('Failed to send verification code. Please check the email address and try again.')
      }
    } catch (error) {
      console.error('Error sending verification:', error)
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code')
      return
    }

    if (verificationCode !== sentVerificationCode) {
      toast.error('Invalid verification code')
      return
    }

    setIsVerifyingEmail(true)
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEmailVerificationStep('verified')
      toast.success('Email verified successfully!')
    } catch (error) {
      console.error('Error verifying email:', error)
      toast.error('Failed to verify email')
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (emailVerificationStep !== 'verified') {
      toast.error('Please verify your email first')
      return
    }

    if (!adminFormData.firstName || !adminFormData.lastName || !adminFormData.phoneNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsCreatingAdmin(true)
    try {
      const adminData = {
        ...adminFormData,
        clientId: selectedClient?._id
      }
      
      await adminAPI.create(adminData)
      toast.success('Admin created successfully!')
      setIsAddAdminDialogOpen(false)
      fetchClients() // Refresh to update admin counts
      
      // If view admins dialog was open, refresh it too
      if (isViewAdminsDialogOpen && selectedClient) {
        handleViewAdmins(selectedClient)
      }
    } catch (error: any) {
      console.error('Error creating admin:', error)
      toast.error(error.response?.data?.message || 'Failed to create admin')
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  const handleUpdateLicense = async () => {
    if (!selectedClient?._id) return

    setIsUpdatingLicense(true)
    try {
      let newLicenseDays: number
      
      if (isLifetime) {
        newLicenseDays = -1
      } else {
        const daysToAdd = calculateLicenseDays(licenseValue, licenseUnit)
        const currentLicense = selectedClient.license || 0
        
        newLicenseDays = licenseAction === 'add' 
          ? currentLicense + daysToAdd 
          : daysToAdd
      }

      await clientAPI.update(selectedClient._id, { license: newLicenseDays })
      
      toast.success(`License ${isLifetime ? 'set to lifetime' : licenseAction === 'add' ? 'added' : 'replaced'} successfully`)
      setIsLicenseDialogOpen(false)
      fetchClients()
    } catch (error) {
      console.error('Error updating license:', error)
      toast.error('Failed to update license')
    } finally {
      setIsUpdatingLicense(false)
    }
  }

  const getTotalLicenseDays = (): number => {
    if (isLifetime) return -1
    
    const daysToModify = calculateLicenseDays(licenseValue, licenseUnit)
    const currentLicense = selectedClient?.license || 0
    
    return licenseAction === 'add' 
      ? currentLicense + daysToModify 
      : daysToModify
  }

  const getClientAdminCount = (clientId: string): number => {
    return admins.filter(admin => admin.clientId === clientId).length
  }

  const formatLicenseDuration = (days: number | undefined): string => {
    if (days === -1) return 'Lifetime'
    return `${days || 0} days`
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
                        <DropdownMenuItem 
                          onClick={() => handleManageLicense(client)}
                          className="cursor-pointer"
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Manage License
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleAddAdmin(client)}
                          className="cursor-pointer"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleViewAdmins(client)}
                          className="cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4" />
                          View Admins ({getClientAdminCount(client._id!)})
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCopyClientId(client._id!)}
                          className="cursor-pointer"
                        >
                          {copiedId === client._id ? (
                            <Check className="mr-2 h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          {copiedId === client._id ? "Copied!" : "Copy Client ID"}
                        </DropdownMenuItem>
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

                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    {/* License Information */}
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">License Duration</span>
                        <Badge 
                          variant={client.license === -1 ? "default" : "outline"} 
                          className={client.license === -1 ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-xs"}
                        >
                          {formatLicenseDuration(client.license)}
                        </Badge>
                      </div>
                      {client.licenseExpiryDate && client.license !== -1 && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Building2 className="w-3 h-3" />
                          <span>Expires {formatDate(client.licenseExpiryDate)}</span>
                        </div>
                      )}
                      {client.license === -1 && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Building2 className="w-3 h-3" />
                          <span className="font-medium">Never Expires</span>
                        </div>
                      )}
                    </div>

                    {/* Admin Count */}
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">Administrators</span>
                        <Badge variant="outline" className="text-xs">
                          {getClientAdminCount(client._id!)} Admin{getClientAdminCount(client._id!) !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        <span>
                          {getClientAdminCount(client._id!) === 0 
                            ? 'No administrators assigned' 
                            : `${getClientAdminCount(client._id!)} administrator${getClientAdminCount(client._id!) !== 1 ? 's' : ''} managing this client`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(client.createdAt)}</span>
                      </div>
                      {/* Debug button - remove this after testing */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewAdmins(client)}
                        className="text-xs h-6"
                      >
                        Test Dialog
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* License Management Dialog */}
      <Dialog open={isLicenseDialogOpen} onOpenChange={setIsLicenseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage License - {selectedClient?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current License Info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Current License</span>
                <Badge 
                  variant={selectedClient?.license === -1 ? "default" : "outline"} 
                  className={selectedClient?.license === -1 ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "text-sm"}
                >
                  {formatLicenseDuration(selectedClient?.license)}
                </Badge>
              </div>
              {selectedClient?.licenseExpiryDate && selectedClient?.license !== -1 && (
                <p className="text-xs text-slate-500 mt-2">
                  Expires: {formatDate(selectedClient.licenseExpiryDate)}
                </p>
              )}
              {selectedClient?.license === -1 && (
                <p className="text-xs text-purple-600 mt-2 font-medium">
                  Never Expires - Lifetime Access
                </p>
              )}
            </div>

            {/* Action Selection */}
            <div className="space-y-2">
              <Label>Action</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLicenseAction('add')
                    setIsLifetime(false)
                  }}
                  disabled={selectedClient?.license === -1}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    licenseAction === 'add' && !isLifetime
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${selectedClient?.license === -1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium text-sm">Add License</div>
                  <div className="text-xs text-slate-500 mt-1">Extend current</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLicenseAction('replace')
                    setIsLifetime(false)
                  }}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    licenseAction === 'replace' && !isLifetime
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-sm">Replace</div>
                  <div className="text-xs text-slate-500 mt-1">Set new duration</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLifetime(true)
                    setLicenseAction('replace')
                  }}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    isLifetime
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-sm">Lifetime</div>
                  <div className="text-xs text-slate-500 mt-1">Never expires</div>
                </button>
              </div>
              {selectedClient?.license === -1 && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Client already has lifetime access. You can only replace it.
                </p>
              )}
            </div>

            {/* License Duration Input */}
            {!isLifetime && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseValue">Duration</Label>
                  <Input
                    id="licenseValue"
                    type="number"
                    min="1"
                    value={licenseValue}
                    onChange={(e) => setLicenseValue(Number(e.target.value))}
                    placeholder="Enter duration"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseUnit">Unit</Label>
                  <select
                    id="licenseUnit"
                    value={licenseUnit}
                    onChange={(e) => setLicenseUnit(e.target.value as 'days' | 'months' | 'years')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months (31 days)</option>
                    <option value="years">Years (365 days)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className={`rounded-lg p-4 border-2 ${
              isLifetime 
                ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {isLifetime 
                      ? 'Lifetime Access' 
                      : licenseAction === 'add' ? 'New Total License' : 'New License Duration'
                    }
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {isLifetime 
                      ? 'Client will have unlimited access'
                      : licenseAction === 'add' 
                        ? `Current (${selectedClient?.license || 0}) + New (${calculateLicenseDays(licenseValue, licenseUnit)})`
                        : `Replacing current license`
                    }
                  </p>
                </div>
                <Badge className={`text-lg px-3 py-1 ${
                  isLifetime 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : ''
                }`}>
                  {isLifetime ? '∞ Lifetime' : `${getTotalLicenseDays()} days`}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLicenseDialogOpen(false)}
              disabled={isUpdatingLicense}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateLicense}
              disabled={isUpdatingLicense || (!isLifetime && licenseValue < 1)}
            >
              {isUpdatingLicense ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : isLifetime ? (
                'Set Lifetime Access'
              ) : (
                `${licenseAction === 'add' ? 'Add' : 'Replace'} License`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Admin - {selectedClient?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Client Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedClient?.logo} alt="Client Logo" />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {selectedClient?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedClient?.name}</h3>
                  <p className="text-sm text-slate-600">
                    {selectedClient?.city}, {selectedClient?.state}
                  </p>
                  <p className="text-xs text-slate-500">{selectedClient?.email}</p>
                </div>
              </div>
            </div>

            {/* Admin Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={adminFormData.firstName}
                  onChange={handleAdminFormChange}
                  placeholder="Enter first name"
                  disabled={isCreatingAdmin}
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={adminFormData.lastName}
                  onChange={handleAdminFormChange}
                  placeholder="Enter last name"
                  disabled={isCreatingAdmin}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={adminFormData.phoneNumber}
                  onChange={handleAdminFormChange}
                  placeholder="Enter phone number"
                  disabled={isCreatingAdmin}
                />
              </div>
            </div>

            {/* Email Verification Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="email">Email Address *</Label>
                {emailVerificationStep === 'verified' && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    ✓ Verified
                  </Badge>
                )}
              </div>

              {emailVerificationStep === 'form' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={adminFormData.email}
                      onChange={handleAdminFormChange}
                      placeholder="Enter email address"
                      disabled={isSendingVerification}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={!adminFormData.email || isSendingVerification}
                      className="whitespace-nowrap"
                    >
                      {isSendingVerification ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Code'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    We'll send a verification code to this email address
                  </p>
                </div>
              )}

              {emailVerificationStep === 'verification' && (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        Verification Code Sent
                      </span>
                    </div>
                    <p className="text-sm text-amber-700">
                      We've sent a 6-digit code to <strong>{adminFormData.email}</strong>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      disabled={isVerifyingEmail}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={!verificationCode || isVerifyingEmail}
                    >
                      {isVerifyingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Didn't receive the code?</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEmailVerificationStep('form')
                        setVerificationCode('')
                      }}
                      className="h-auto p-0 text-blue-600 hover:text-blue-800"
                    >
                      Change email
                    </Button>
                  </div>
                </div>
              )}

              {emailVerificationStep === 'verified' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Email Verified</p>
                      <p className="text-xs text-green-600">{adminFormData.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddAdminDialogOpen(false)}
              disabled={isCreatingAdmin}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateAdmin}
              disabled={
                isCreatingAdmin || 
                emailVerificationStep !== 'verified' ||
                !adminFormData.firstName ||
                !adminFormData.lastName ||
                !adminFormData.phoneNumber
              }
            >
              {isCreatingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                'Create Admin'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Admins Dialog - Simplified */}
      <Dialog open={isViewAdminsDialogOpen} onOpenChange={setIsViewAdminsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Admins for {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Simple Admin List */}
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Total Admins: {clientAdmins.length}
              </p>
              
              {clientAdmins.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No admins found</p>
                  <Button
                    onClick={() => {
                      setIsViewAdminsDialogOpen(false)
                      if (selectedClient) {
                        handleAddAdmin(selectedClient)
                      }
                    }}
                    className="mt-4"
                    size="sm"
                  >
                    Add First Admin
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientAdmins.map((admin, index) => (
                    <div key={admin._id || index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {admin.firstName} {admin.lastName}
                          </p>
                          <p className="text-sm text-slate-600">{admin.email}</p>
                          <p className="text-sm text-slate-600">{admin.phoneNumber}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (admin._id.startsWith('mock-')) {
                              // Remove mock admin
                              setClientAdmins(prev => prev.filter(a => a._id !== admin._id))
                              toast.success('Mock admin removed')
                            } else {
                              handleDeleteClientAdmin(admin._id, `${admin.firstName} ${admin.lastName}`)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewAdminsDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewAdminsDialogOpen(false)
                if (selectedClient) {
                  handleAddAdmin(selectedClient)
                }
              }}
            >
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default ClientsPage
