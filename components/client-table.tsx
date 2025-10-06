"use client"

import { useState } from "react"
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

// Mock data for demonstration
const mockClients = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phoneNumber: "1234567890",
        city: "New York",
        state: "NY",
        address: "123 Main St",
        logo: "/generic-company-logo.png",
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phoneNumber: "0987654321",
        city: "Los Angeles",
        state: "CA",
        address: "456 Oak Ave",
        logo: "/abstract-business-logo.png",
    },
    {
        id: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        phoneNumber: "5555555555",
        city: "Chicago",
        state: "IL",
        address: "789 Pine Rd",
        logo: "/generic-corporate-logo.png",
    },
]

export function ClientsTable() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [clients, setClients] = useState(mockClients)
    const [editingClient, setEditingClient] = useState<any>(null)
    const [copiedId, setCopiedId] = useState<number | null>(null)

    const handleClientAdded = (newClient: any) => {
        if (editingClient) {
            setClients(
                clients.map((client) => (client.id === editingClient.id ? { ...newClient, id: editingClient.id } : client)),
            )
            setEditingClient(null)
        } else {
            const clientWithId = {
                ...newClient,
                id: clients.length + 1,
            }
            setClients([...clients, clientWithId])
        }
        setIsDialogOpen(false)
    }

    const handleDeleteClient = (clientId: number) => {
        setClients(clients.filter((client) => client.id !== clientId))
    }

    const handleCopyId = async (clientId: number) => {
        try {
            await navigator.clipboard.writeText(clientId.toString())
            setCopiedId(clientId)
            setTimeout(() => setCopiedId(null), 2000)
        } catch (err) {
            console.error("Failed to copy ID:", err)
        }
    }

    const handleEditClient = (client: any) => {
        setEditingClient(client)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) {
            setEditingClient(null)
        }
    }

    return (
        <div className="w-full space-y-6">
            {/* Header with Add Client Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">All Clients</h2>
                    <p className="text-muted-foreground">Total clients: {clients.length}</p>
                </div>

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

            {/* Clients Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-16">Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No clients found. Click &quot;Add Client&quot; to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id} className="hover:bg-muted/30">
                                    <TableCell>
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
                                    <TableCell>
                                        <div className="font-medium text-foreground">{client.name}</div>
                                    </TableCell>
                                    <TableCell>
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
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {client.city}, {client.state}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">{client.address}</span>
                                    </TableCell>
                                    <TableCell>
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
                                                <DropdownMenuItem onClick={() => handleCopyId(client.id)}>
                                                    {copiedId === client.id ? (
                                                        <Check className="mr-2 h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="mr-2 h-4 w-4" />
                                                    )}
                                                    {copiedId === client.id ? "Copied!" : "Copy ID"}
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
                                                                onClick={() => handleDeleteClient(client.id)}
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
        </div>
    )
}
