"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Calendar, Building2, Plus, MoreVertical, Pencil, Trash2, Search, Key, Loader2 } from 'lucide-react'
import { clientAPI } from '@/lib/api'
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

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(client.createdAt)}</span>
                      </div>
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
    </main>
  )
}

export default ClientsPage
