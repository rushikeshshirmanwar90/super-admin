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
import { AdminForm } from "@/components/admin-form"
import { ClientForm } from "@/components/client-form"
import { Plus, Mail, Phone, MoreHorizontal, Edit, Trash2, Loader2, UserX, UserPlus } from "lucide-react"
import { AdminData, ClientData } from "@/lib/types"
import axios from "axios"
import { errorToast, successToast } from "./toast"

interface AdminTableProps {
    clientId: string
}

export function AdminTable({ clientId }: AdminTableProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isClientDialogOpen, setIsClientDialogOpen] = useState(false)
    const [admins, setAdmins] = useState<AdminData[]>([])
    const [editingAdmin, setEditingAdmin] = useState<AdminData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Load admins for the specific client
    useEffect(() => {
        const loadAdmins = async () => {
            setIsLoading(true)
            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_DOMAIN}/api/admin?clientId=${clientId}`
                )

                console.log("Admin API Response:", res.data)

                let adminsData: AdminData[] = []

                if (res.data && res.data.data) {
                    if (Array.isArray(res.data.data)) {
                        adminsData = res.data.data
                    } else if (typeof res.data.data === 'object') {
                        // Single admin object, wrap in array
                        adminsData = [res.data.data]
                    }
                } else if (Array.isArray(res.data)) {
                    adminsData = res.data
                }

                setAdmins(adminsData)
            } catch (error) {
                console.error("Error fetching admins:", error)
                if (axios.isAxiosError(error)) {
                    // Don't show error toast for 404 (no admins found)
                    if (error.response?.status !== 404) {
                        errorToast(error.response?.data?.message || "Failed to load admins")
                    }
                } else {
                    errorToast("Failed to load admins")
                }
                setAdmins([])
            } finally {
                setIsLoading(false)
            }
        }

        if (clientId) {
            loadAdmins()
        }
    }, [clientId])

    const handleAdminAdded = (admin: AdminData) => {
        if (editingAdmin) {
            // Update existing admin
            setAdmins(admins.map((a) => (a._id === editingAdmin._id ? admin : a)))
        } else {
            // Add new admin
            setAdmins([...admins, admin])
        }
        setIsDialogOpen(false)
        setEditingAdmin(null)
    }

    const handleDeleteAdmin = async (adminId: string) => {
        try {
            const res = await axios.delete(
                `${process.env.NEXT_PUBLIC_DOMAIN}/api/admin?id=${adminId}`
            )

            if (res.status === 200) {
                setAdmins(admins.filter((a) => a._id !== adminId))
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

    const handleEditAdmin = (admin: AdminData) => {
        setEditingAdmin(admin)
        setIsDialogOpen(true)
    }

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open)
        if (!open) {
            setEditingAdmin(null)
        }
    }

    const handleClientAdded = (client: ClientData) => {
        console.log("Client added:", client)
        successToast("Client added successfully!")
        setIsClientDialogOpen(false)
    }

    return (
        <div className="w-full space-y-6">
            {/* Header with Add Admin Button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">Admins</h2>
                    <p className="text-muted-foreground">
                        {isLoading ? "Loading..." : `Total admins: ${admins.length}`}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add Admin
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingAdmin ? "Edit Admin" : "Add New Admin"}</DialogTitle>
                            </DialogHeader>
                            <AdminForm
                                onAdminAdded={handleAdminAdded}
                                clientId={clientId}
                                initialData={editingAdmin}
                                onClose={() => handleDialogClose(false)}
                            />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Add Client
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Client</DialogTitle>
                            </DialogHeader>
                            <ClientForm onClientAdded={handleClientAdded} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Admins Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[25%]">Name</TableHead>
                            <TableHead className="w-[30%]">Email</TableHead>
                            <TableHead className="w-[25%]">Phone Number</TableHead>
                            <TableHead className="w-[20%]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-muted-foreground">Loading admins...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : admins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <UserX className="h-12 w-12 text-muted-foreground/50" />
                                        <div>
                                            <p className="text-lg font-medium text-foreground">No admins found</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Click &quot;Add Admin&quot; to create the first admin for this client.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            admins.map((admin, idx) => (
                                <TableRow key={admin._id ?? idx} className="hover:bg-muted/30">
                                    <TableCell className="w-[25%]">
                                        <div className="font-medium text-foreground">
                                            {admin.firstName} {admin.lastName}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[30%]">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{admin.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[25%]">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{admin.phoneNumber}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[20%]">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditAdmin(admin)}>
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
                                                                Are you sure you want to delete admin &quot;{admin.firstName}{" "}
                                                                {admin.lastName}&quot;? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteAdmin(admin._id ?? "")}
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
