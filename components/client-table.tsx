"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClientForm } from "@/components/client-form"
import { AdminForm } from "@/components/admin-form"
import { LicenseForm } from "@/components/license-form"
import { Plus, Mail, Phone, MapPin, MoreHorizontal, Edit, Trash2, Copy, Check, Users, Loader2, ChevronDown, ChevronUp, Clock, Shield, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { ClientData, AdminData } from "@/lib/types"
import axios from "axios"
import { errorToast, successToast } from "./toast"

interface ClientDataWithAdmins extends Omit<ClientData, 'licenseExpiryDate'> {
    admins?: AdminData[]
    adminsLoaded?: boolean
    loadingAdmins?: boolean
    licenseExpiryDate?: string
    license?: number
    isLicenseActive?: boolean
}

export function ClientsTable() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [clients, setClients] = useState<ClientDataWithAdmins[]>([])
    const [editingClient, setEditingClient] = useState<ClientDataWithAdmins | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
    const [adminClientId, setAdminClientId] = useState<string | null>(null)
    const [editingAdmin, setEditingAdmin] = useState<AdminData | null>(null)
    const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set())
    const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false)
    const [licenseClientId, setLicenseClientId] = useState<string | null>(null)
    const [licenseClientName, setLicenseClientName] = useState<string>("")
    const [currentLicense, setCurrentLicense] = useState<number>(0)

    const handleClientAdded = (newClient: ClientData) => {
        if (editingClient) {
            // Update existing client in the list
            setClients(
                clients.map((client) =>
                    client._id === editingClient._id
                        ? { 
                            ...newClient, 
                            _id: editingClient._id, 
                            admins: client.admins, 
                            adminsLoaded: client.adminsLoaded,
                            licenseExpiryDate: typeof newClient.licenseExpiryDate === 'string' 
                                ? newClient.licenseExpiryDate 
                                : newClient.licenseExpiryDate?.toISOString()
                        }
                        : client,
                ),
            )
            setEditingClient(null)
        } else {
            // Add new client to the list
            const clientWithAdmins: ClientDataWithAdmins = {
                ...newClient,
                admins: [],
                adminsLoaded: false,
                licenseExpiryDate: typeof newClient.licenseExpiryDate === 'string' 
                    ? newClient.licenseExpiryDate 
                    : newClient.licenseExpiryDate?.toISOString()
            }
            setClients([...clients, clientWithAdmins])
        }
        setIsDialogOpen(false)
    }

    const handleDeleteClient = async (clientId: string) => {
        try {
            const client = clients.find(c => c._id === clientId)
            if (!client) return

            const res = await axios.delete(
                `${process.env.NEXT_PUBLIC_DOMAIN}/api/client?email=${client.email}`
            )

            if (res.status === 200) {
                setClients(clients.filter((client) => client._id !== clientId))
                successToast("Client deleted successfully!")
            }
        } catch (error) {
            console.error("Error deleting client:", error)
            if (axios.isAxiosError(error)) {
                errorToast(error.response?.data?.message || "Failed to delete client")
            } else {
                errorToast("Failed to delete client. Please try again.")
            }
        }
    }

    const handleCopyId = async (clientId: string) => {
        try {
            console.log("Copying client ID:", clientId)
            await navigator.clipboard.writeText(clientId)
            setCopiedId(clientId)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            console.error("Failed to copy ID:", err)
        }
    }

    const handleEditClient = (client: ClientData) => {
        const clientWithAdmins: ClientDataWithAdmins = {
            ...client,
            licenseExpiryDate: typeof client.licenseExpiryDate === 'string' 
                ? client.licenseExpiryDate 
                : client.licenseExpiryDate?.toISOString()
        }
        setEditingClient(clientWithAdmins)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) {
            setEditingClient(null)
        }
    }

    // Load admins for a specific client
    const handleLoadAdmins = async (clientId: string) => {
        try {
            console.log("Loading admins for client ID:", clientId)
            // Set loading state
            setClients((prev) =>
                prev.map((client) =>
                    client._id === clientId
                        ? { ...client, loadingAdmins: true }
                        : client
                )
            )

            const adminRes = await axios.get(
                `${process.env.NEXT_PUBLIC_DOMAIN}/api/admin?clientId=${clientId}`
            )
            const admins = adminRes.data.data || []

            setClients((prev) =>
                prev.map((client) =>
                    client._id === clientId
                        ? {
                            ...client,
                            admins: Array.isArray(admins) ? admins : [admins],
                            adminsLoaded: true,
                            loadingAdmins: false
                        }
                        : client
                )
            )
        } catch (error) {
            console.error(`Error fetching admins for client ${clientId}:`, error)
            
            // Check if it's a 404 error (no admin found)
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                // Set admins as empty array and mark as loaded for 404 case
                setClients((prev) =>
                    prev.map((client) =>
                        client._id === clientId
                            ? {
                                ...client,
                                admins: [],
                                adminsLoaded: true,
                                loadingAdmins: false
                            }
                            : client
                    )
                )
            } else {
                // For other errors, show error toast and reset loading state
                errorToast("Failed to load admins")
                setClients((prev) =>
                    prev.map((client) =>
                        client._id === clientId
                            ? { ...client, loadingAdmins: false }
                            : client
                    )
                )
            }
        }
    }

    // Open admin dialog for a specific client
    const handleOpenAdminDialog = (clientId: string, admin?: AdminData) => {
        console.log("Opening admin dialog for client ID:", clientId)
        setAdminClientId(clientId)
        setEditingAdmin(admin || null)
        setIsAdminDialogOpen(true)
    }

    // Handle admin added/updated
    const handleAdminAdded = (admin: AdminData) => {
        if (editingAdmin) {
            // Update existing admin
            setClients((prev) =>
                prev.map((client) =>
                    client._id === adminClientId
                        ? {
                            ...client,
                            admins: client.admins?.map((a) =>
                                a._id === editingAdmin._id ? admin : a
                            ),
                        }
                        : client
                )
            )
        } else {
            // Add new admin
            setClients((prev) =>
                prev.map((client) =>
                    client._id === adminClientId
                        ? { ...client, admins: [...(client.admins || []), admin] }
                        : client
                )
            )
        }
        setIsAdminDialogOpen(false)
        setAdminClientId(null)
        setEditingAdmin(null)
    }

    // Delete admin
    const handleDeleteAdmin = async (adminId: string, clientId: string) => {
        try {
            const res = await axios.delete(
                `${process.env.NEXT_PUBLIC_DOMAIN}/api/admin?id=${adminId}`
            )

            if (res.status === 200) {
                setClients((prev) =>
                    prev.map((client) =>
                        client._id === clientId
                            ? {
                                ...client,
                                admins: client.admins?.filter((a) => a._id !== adminId),
                            }
                            : client
                    )
                )
                successToast("Admin deleted successfully!")
            }
        } catch (error) {
            console.error("Error deleting admin:", error)
            if (axios.isAxiosError(error)) {
                errorToast(error.response?.data?.message || "Failed to delete admin")
            } else {
                errorToast("Failed to delete admin. Please try again.")
            }
        }
    }

    // Open license dialog for a specific client
    const handleOpenLicenseDialog = (clientId: string, clientName: string, license: number) => {
        setLicenseClientId(clientId)
        setLicenseClientName(clientName)
        setCurrentLicense(license)
        setIsLicenseDialogOpen(true)
    }

    // Handle license updated
    const handleLicenseUpdated = (clientId: string, newLicense: number, isActive: boolean, expiryDate?: string) => {
        setClients((prev) =>
            prev.map((client) =>
                client._id === clientId
                    ? { 
                        ...client, 
                        license: newLicense, 
                        isLicenseActive: isActive,
                        licenseExpiryDate: expiryDate
                    }
                    : client
            )
        )
        setIsLicenseDialogOpen(false)
        setLicenseClientId(null)
        setLicenseClientName("")
        setCurrentLicense(0)
    }

    // Get license status display
    const getLicenseStatus = (license: number, isActive: boolean) => {
        if (license === -1) {
            return {
                text: "Lifetime",
                color: "text-green-600",
                bgColor: "bg-green-100",
                icon: "shield"
            }
        }
        if (license === 0 || !isActive) {
            return {
                text: "Expired",
                color: "text-red-600",
                bgColor: "bg-red-100",
                icon: "alert-triangle"
            }
        }
        if (license <= 7) {
            return {
                text: `${license}d left`,
                color: "text-orange-600",
                bgColor: "bg-orange-100",
                icon: "clock"
            }
        }
        return {
            text: `${license}d left`,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            icon: "clock"
        }
    }

    const handleCloseAdminDialog = () => {
        setIsAdminDialogOpen(false)
        setAdminClientId(null)
        setEditingAdmin(null)
    }

    // Toggle address expansion
    const toggleAddressExpansion = (clientId: string) => {
        setExpandedAddresses(prev => {
            const newSet = new Set(prev)
            if (newSet.has(clientId)) {
                newSet.delete(clientId)
            } else {
                newSet.add(clientId)
            }
            return newSet
        })
    }

    // Truncate address text
    const truncateAddress = (address: string, maxLength: number = 50) => {
        if (address.length <= maxLength) return address
        return address.substring(0, maxLength) + "..."
    }

    useEffect(() => {
        const getClientData = async () => {
            try {
                // Try /api/client first (without 's')
                const res = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/client`)

                console.log("Full API Response:", res.data)

                // Based on your API code, successResponse wraps data like: { success: true, data: [...], message: "..." }
                let clientsData: ClientData[] = []

                if (res.data && res.data.data) {
                    // If data property exists, use it
                    if (Array.isArray(res.data.data)) {
                        clientsData = res.data.data
                    } else if (typeof res.data.data === 'object') {
                        // Single client object, wrap in array
                        clientsData = [res.data.data]
                    }
                } else if (Array.isArray(res.data)) {
                    // Direct array response
                    clientsData = res.data
                }

                console.log("Extracted clientsData:", clientsData)
                console.log("Number of clients:", clientsData.length)

                if (!Array.isArray(clientsData)) {
                    console.error("clientsData is not an array:", clientsData)
                    errorToast("Invalid data format received from server")
                    return
                }

                // Map clients with admin properties
                const clientsWithoutAdmins: ClientDataWithAdmins[] = clientsData.map((client: ClientData) => ({
                    ...client,
                    admins: [],
                    adminsLoaded: false,
                    loadingAdmins: false,
                    licenseExpiryDate: typeof client.licenseExpiryDate === 'string' 
                        ? client.licenseExpiryDate 
                        : client.licenseExpiryDate?.toISOString()
                }))

                console.log("Final clients to set:", clientsWithoutAdmins)
                setClients(clientsWithoutAdmins)
            } catch (error) {
                console.error("Error fetching clients:", error)
                if (axios.isAxiosError(error)) {
                    errorToast(error.response?.data?.message || "Failed to load clients")
                } else {
                    errorToast("Failed to load clients")
                }
            }
        }

        getClientData()
    }, [])
    return (
        <div className="w-full space-y-6">
            {/* Header with Add Client and Add Admin Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">All Clients</h2>

                    <p className="text-muted-foreground">Total clients: {clients.length}</p>
                    <p className="text-muted-foreground">
                        Admins: {clients.reduce((acc, client) => acc + (client.admins?.length || 0), 0)}
                    </p>
                    <p className="text-muted-foreground">
                        Active licenses: {clients.filter(c => (c.license ?? 0) > 0 || (c.license ?? 0) === -1).length} | 
                        Expired: {clients.filter(c => (c.license ?? 0) === 0).length} | 
                        Lifetime: {clients.filter(c => (c.license ?? 0) === -1).length}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Client
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                            </DialogHeader>

                            <ClientForm onClientAdded={handleClientAdded} initialData={editingClient} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {/* Clients Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[12%]">Logo</TableHead>
                            <TableHead className="w-[12%]">Name</TableHead>
                            <TableHead className="w-[12%]">Contact</TableHead>
                            <TableHead className="w-[8%]">Location</TableHead>
                            <TableHead className="w-[12%]">Address</TableHead>
                            <TableHead className="w-[10%]">License</TableHead>
                            <TableHead className="w-[18%]">Admins</TableHead>
                            <TableHead className="w-[15%]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No clients found. Click &quot;Add Client&quot; to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client, idx) => {
                                console.log("Client object:", client);
                                console.log("Client keys:", Object.keys(client));
                                console.log("Client _id:", client._id);

                                // Safely access properties with fallbacks
                                const anyClient = client as any;
                                const name = anyClient.name || anyClient.companyName || anyClient.clientName || 'N/A';
                                const email = anyClient.email || anyClient.contactEmail || 'N/A';
                                const phoneNumber = anyClient.phoneNumber || anyClient.phone || anyClient.contactNumber || 'N/A';
                                const city = anyClient.city || 'N/A';
                                const state = anyClient.state || 'N/A';
                                const address = anyClient.address || anyClient.fullAddress || 'N/A';
                                const logo = anyClient.logo || anyClient.logoUrl || '/placeholder.svg';
                                const license = anyClient.license !== undefined ? anyClient.license : 0;
                                const isLicenseActive = anyClient.isLicenseActive !== undefined ? anyClient.isLicenseActive : false;
                                // Get the client ID that will be used consistently
                                const clientId = client._id ?? "";
                                console.log("Using client ID for this row:", clientId);
                                const licenseStatus = getLicenseStatus(license, isLicenseActive);

                                return (
                                    <TableRow key={clientId || client.email || idx} className="hover:bg-muted/30">
                                        <TableCell className="w-[12%]">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                                <Image
                                                    src={logo}
                                                    alt={`${name} logo`}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[12%]">
                                            <div className="font-medium text-foreground">{name}</div>
                                        </TableCell>
                                        <TableCell className="w-[12%]">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">{email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">{phoneNumber}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[8%]">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {city}, {state}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[12%]">
                                            <div className="space-y-1">
                                                <div className="text-sm text-muted-foreground">
                                                    {expandedAddresses.has(clientId) ? address : truncateAddress(address)}
                                                </div>
                                                {address.length > 50 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 p-1 text-xs text-blue-600 hover:text-blue-800"
                                                        onClick={() => toggleAddressExpansion(clientId)}
                                                    >
                                                        {expandedAddresses.has(clientId) ? (
                                                            <>
                                                                <ChevronUp className="h-3 w-3 mr-1" />
                                                                See less
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="h-3 w-3 mr-1" />
                                                                See more
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[10%]">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${licenseStatus.bgColor} ${licenseStatus.color}`}>
                                                    {licenseStatus.icon === 'shield' && <Shield className="h-3 w-3 mr-1" />}
                                                    {licenseStatus.icon === 'clock' && <Clock className="h-3 w-3 mr-1" />}
                                                    {licenseStatus.icon === 'alert-triangle' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                                    {licenseStatus.text}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs px-2 py-1 h-6"
                                                        onClick={() => handleOpenLicenseDialog(clientId, name, license)}
                                                    >
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        Manage
                                                    </Button>
                                                    {license !== -1 && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs px-2 py-1 h-6 border-green-200 hover:bg-green-50 text-green-700"
                                                            onClick={() => {
                                                                // Quick action to set lifetime
                                                                if (confirm(`Grant lifetime access to ${name}?`)) {
                                                                    handleLicenseUpdated(clientId, -1, true, undefined)
                                                                    // Also update via API
                                                                    axios.put(`${process.env.NEXT_PUBLIC_DOMAIN}/api/license`, {
                                                                        clientId,
                                                                        licenseValue: 1,
                                                                        licenseUnit: 'lifetime'
                                                                    }).then(() => {
                                                                        successToast('Lifetime access granted!')
                                                                    }).catch(err => {
                                                                        errorToast('Failed to grant lifetime access')
                                                                        console.error(err)
                                                                    })
                                                                }
                                                            }}
                                                            title="Grant Lifetime Access"
                                                        >
                                                            <Shield className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[18%]">
                                            <div className="space-y-2">
                                                {!client.adminsLoaded ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => handleLoadAdmins(clientId)}
                                                        disabled={client.loadingAdmins}
                                                    >
                                                        {client.loadingAdmins ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                Loading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Users className="mr-2 h-3 w-3" />
                                                                Load Admins
                                                            </>
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <>
                                                        {(!client.admins || client.admins.length === 0) ? (
                                                            <div className="space-y-2">
                                                                <div className="text-xs text-muted-foreground text-center py-2">
                                                                    No admin
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full"
                                                                    onClick={() => handleOpenAdminDialog(clientId)}
                                                                >
                                                                    <Plus className="mr-2 h-3 w-3" />
                                                                    Add Admin
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {client.admins.map((admin) => (
                                                                    <div key={admin._id} className="flex items-center justify-between gap-2 p-2 bg-muted/30 rounded">
                                                                        <div className="text-xs flex-1">
                                                                            <div className="font-medium">{admin.firstName} {admin.lastName}</div>
                                                                            <div className="text-muted-foreground">{admin.email}</div>
                                                                        </div>
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                                    <MoreHorizontal className="h-3 w-3" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <DropdownMenuItem onClick={() => handleOpenAdminDialog(clientId, admin)}>
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    Edit
                                                                                </DropdownMenuItem>
                                                                                <AlertDialog>
                                                                                    <AlertDialogTrigger asChild>
                                                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                                                                            <span className="text-red-600">Delete</span>
                                                                                        </DropdownMenuItem>
                                                                                    </AlertDialogTrigger>
                                                                                    <AlertDialogContent>
                                                                                        <AlertDialogHeader>
                                                                                            <AlertDialogTitle>Delete Admin?</AlertDialogTitle>
                                                                                            <AlertDialogDescription>
                                                                                                Are you sure you want to delete admin &quot;{admin.firstName} {admin.lastName}&quot;? This action cannot be undone.
                                                                                            </AlertDialogDescription>
                                                                                        </AlertDialogHeader>
                                                                                        <AlertDialogFooter>
                                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                            <AlertDialogAction
                                                                                                onClick={() => handleDeleteAdmin(admin._id ?? "", clientId)}
                                                                                                className="bg-red-600 hover:bg-red-700"
                                                                                            >
                                                                                                Delete
                                                                                            </AlertDialogAction>
                                                                                        </AlertDialogFooter>
                                                                                    </AlertDialogContent>
                                                                                </AlertDialog>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                ))}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full"
                                                                    onClick={() => handleOpenAdminDialog(clientId)}
                                                                >
                                                                    <Plus className="mr-2 h-3 w-3" />
                                                                    Add Admin
                                                                </Button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-[15%]">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleCopyId(clientId)}>
                                                        {copiedId === clientId ? (
                                                            <Check className="mr-2 h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="mr-2 h-4 w-4" />
                                                        )}
                                                        {copiedId === clientId ? "Copied!" : "Copy ID"}
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                                                <span className="text-red-600">Delete</span>
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the client &quot;{client.name}&quot;
                                                                    and remove their data from the system.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteClient(clientId)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Admin Dialog */}
            <Dialog open={isAdminDialogOpen} onOpenChange={handleCloseAdminDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAdmin ? "Edit Admin" : "Add Admin"}</DialogTitle>
                    </DialogHeader>
                    {adminClientId && (
                        <AdminForm
                            onAdminAdded={handleAdminAdded}
                            clientId={adminClientId}
                            initialData={editingAdmin}
                            onClose={handleCloseAdminDialog}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* License Management Dialog */}
            {licenseClientId && (
                <LicenseForm
                    isOpen={isLicenseDialogOpen}
                    onClose={() => setIsLicenseDialogOpen(false)}
                    clientId={licenseClientId}
                    clientName={licenseClientName}
                    currentLicense={currentLicense}
                    onLicenseUpdated={(newLicense, isActive, expiryDate) => 
                        handleLicenseUpdated(licenseClientId, newLicense, isActive, expiryDate)
                    }
                />
            )}
        </div>
    )
}