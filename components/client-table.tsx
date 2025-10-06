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
import { Plus, Mail, Phone, MapPin, MoreHorizontal, Edit, Trash2, Copy, Check } from "lucide-react"
import Image from "next/image"
import { ClientData } from "@/lib/types"
import axios from "axios"

interface AdminData {
    firstName: string
    lastName: string
    email: string
    phoneNumber: number
    clientId: string
}

interface ClientDataWithAdmins extends ClientData {
    admins?: AdminData[]
}

export function ClientsTable() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [clients, setClients] = useState<ClientDataWithAdmins[]>([])
    const [editingClient, setEditingClient] = useState<ClientDataWithAdmins | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false)
    const [adminForm, setAdminForm] = useState<AdminData>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: 0,
        clientId: ""
    })
    const [adminClientId, setAdminClientId] = useState<string | null>(null)

    const handleClientAdded = (newClient: ClientData) => {
        if (editingClient) {
            setClients(
                clients.map((client) =>
                    client._id === editingClient._id ? { ...newClient, _id: editingClient._id } : client,
                ),
            )
            setEditingClient(null)
        } else {
            const clientWithId: ClientData = {
                ...newClient,
                _id: (clients.length + 1).toString(),
            }
            setClients([...clients, clientWithId])
        }
        setIsDialogOpen(false)
    }

    const handleDeleteClient = (clientId: string) => {
        setClients(clients.filter((client) => client._id !== clientId))
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
    const handleOpenAdminDialog = (clientId: string) => {
        setAdminClientId(clientId)
        setAdminForm({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: 0,
            clientId
        })
        setIsAdminDialogOpen(true)
    }

    // Add admin for a specific client
    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("handleAddAdmin called") // For debugging, remove in production
        if (!adminClientId) return
        const newAdmin: AdminData = {
            ...adminForm,
            clientId: adminClientId,
        }
        setClients((prev) =>
            prev.map((client) =>
                client._id === adminClientId
                    ? { ...client, admins: [...(client.admins || []), newAdmin] }
                    : client,
            ),
        )

        const payload = {
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            email: newAdmin.email,
            phoneNumber: newAdmin.phoneNumber,
            clientId: newAdmin.clientId,
        }

        // Console log required fields
        console.log(payload)

        const res = await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/admin`, payload)

        if (res) {
            alert("Admin added successfully")
        }

        setAdminForm({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: 0,
            clientId: ""
        })
        setAdminClientId(null)
        setIsAdminDialogOpen(false)
    }

    useEffect(() => {
        const getClientData = async () => {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_DOMAIN}/api/clients`)
            const data = res.data.data
            // Ensure each client has an admins array
            setClients(data.map((c: ClientData) => ({ ...c, admins: [] })))
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
                                        {(!client.admins || client.admins.length === 0) ? (
                                            <span className="text-xs text-muted-foreground">No admins</span>
                                        ) : (
                                            client.admins.map((admin, idx) => (
                                                <div key={idx} className="text-xs">
                                                    {admin.firstName} ({admin.email})
                                                </div>
                                            ))
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => handleOpenAdminDialog(client._id ?? "")}
                                        >
                                            Add Admin
                                        </Button>
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

            {/* Add Admin Dialog */}
            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Admin</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input
                                type="text"
                                required
                                value={adminForm.firstName}
                                onChange={e => setAdminForm({ ...adminForm, firstName: e.target.value })}
                                className="w-full border rounded px-2 py-1"
                                placeholder="First name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                required
                                value={adminForm.lastName}
                                onChange={e => setAdminForm({ ...adminForm, lastName: e.target.value })}
                                className="w-full border rounded px-2 py-1"
                                placeholder="Last name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={adminForm.email}
                                onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                                className="w-full border rounded px-2 py-1"
                                placeholder="Admin email"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone Number</label>
                            <input
                                type="number"
                                required
                                value={adminForm.phoneNumber === 0 ? "" : adminForm.phoneNumber}
                                onChange={e => setAdminForm({ ...adminForm, phoneNumber: Number(e.target.value) })}
                                className="w-full border rounded px-2 py-1"
                                placeholder="Phone number"
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Add Admin
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
