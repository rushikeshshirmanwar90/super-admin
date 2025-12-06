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
import { Plus, Mail, Phone, MapPin, MoreHorizontal, Edit, Trash2, Copy, Check } from "lucide-react"
import Image from "next/image"
import { ClientData, AdminData } from "@/lib/types"
import axios from "axios"
import { errorToast, successToast } from "./toast"

interface ClientDataWithAdmins extends ClientData {
    admins?: AdminData[]
}

export function ClientsTable() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [clients, setClients] = useState<ClientDataWithAdmins[]>([])
    const [editingClient, setEditingClient] = useState<ClientDataWithAdmins | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
    const [adminClientId, setAdminClientId] = useState<string | null>(null)
    const [editingAdmin, setEditingAdmin] = useState<AdminData | null>(null)

    const handleClientAdded = (newClient: ClientData) => {
        if (editingClient) {
            // Update existing client in the list
            setClients(
                clients.map((client) =>
                    client._id === editingClient._id
                        ? { ...newClient, _id: editingClient._id, admins: client.admins }
                        : client,
                ),
            )
            setEditingClient(null)
        } else {
            // Add new client to the list
            const clientWithAdmins: ClientDataWithAdmins = {
                ...newClient,
                admins: []
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
            await navigator.clipboard.writeText(clientId)
            setCopiedId(clientId)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            console.error("Failed to copy ID:", err)
        }
    }

    const handleEditClient = (client: ClientData) => {
        setEditingClient(client)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) {
            setEditingClient(null)
        }
    }

    // Open admin dialog for a specific client
    const handleOpenAdminDialog = (clientId: string, admin?: AdminData) => {
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

    const handleCloseAdminDialog = () => {
        setIsAdminDialogOpen(false)
        setAdminClientId(null)
        setEditingAdmin(null)
    }

    useEffect(() => {
        const getClientData = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/clients`)
                const clientsData = res.data.clientData || res.data.data || []

                // Fetch admins for each client
                const clientsWithAdmins = await Promise.all(
                    clientsData.map(async (client: ClientData) => {
                        try {
                            const adminRes = await axios.get(
                                `${process.env.NEXT_PUBLIC_DOMAIN}/api/admin?clientId=${client._id}`
                            )
                            const admins = adminRes.data.data || []
                            return { ...client, admins: Array.isArray(admins) ? admins : [admins] }
                        } catch (error) {
                            console.error(`Error fetching admins for client ${client._id}:`, error)
                            return { ...client, admins: [] }
                        }
                    })
                )

                setClients(clientsWithAdmins)
            } catch (error) {
                console.error("Error fetching clients:", error)
                errorToast("Failed to load clients")
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
                            <TableHead className="w-[15%]">Logo</TableHead>
                            <TableHead className="w-[15%]">Name</TableHead>
                            <TableHead className="w-[15%]">Contact</TableHead>
                            <TableHead className="w-[10%]">Location</TableHead>
                            <TableHead className="w-[20%]">Address</TableHead>
                            <TableHead className="w-[15%]">Admins</TableHead>
                            <TableHead className="w-[15%]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No clients found. Click &quot;Add Client&quot; to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client._id} className="hover:bg-muted/30">
                                    <TableCell className="w-[15%]">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                            <Image
                                                src={client.logo || "/placeholder.svg"}
                                                alt={`${client.name} logo`}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[15%]">
                                        <div className="font-medium text-foreground">{client.name}</div>
                                    </TableCell>
                                    <TableCell className="w-[15%]">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">{client.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-muted-foreground">{client.phoneNumber}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[10%]">
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {client.city}, {client.state}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[20%]">
                                        <span className="text-sm text-muted-foreground">{client.address}</span>
                                    </TableCell>
                                    <TableCell className="w-[15%]">
                                        <div className="space-y-2">
                                            {(!client.admins || client.admins.length === 0) ? (
                                                <span className="text-xs text-muted-foreground">No admins</span>
                                            ) : (
                                                client.admins.map((admin) => (
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
                                                                <DropdownMenuItem onClick={() => handleOpenAdminDialog(client._id ?? "", admin)}>
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
                                                                                onClick={() => handleDeleteAdmin(admin._id ?? "", client._id ?? "")}
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
                                                ))
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleOpenAdminDialog(client._id ?? "")}
                                            >
                                                <Plus className="mr-2 h-3 w-3" />
                                                Add Admin
                                            </Button>
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
                                                <DropdownMenuItem onClick={() => handleCopyId(client._id ?? "")}>
                                                    {copiedId === client._id ? (
                                                        <Check className="mr-2 h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="mr-2 h-4 w-4" />
                                                    )}
                                                    {copiedId === client._id ? "Copied!" : "Copy ID"}
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
                                                                onClick={() => handleDeleteClient(client._id ?? "")}
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
                            ))
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
        </div>
    )
}
