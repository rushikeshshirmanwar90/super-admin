"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    Settings,
    Users,
    UserCircle2,
    Calendar,
    Home,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

export function AdminSidebar() {
    const pathname = usePathname()
    const { open } = useSidebar()

    const navigation = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Clients", href: "/clients", icon: Users },
        { name: "Licenses", href: "/licenses", icon: Calendar },
    ]

    if (!open) return null

    return (
        <Sidebar variant="sidebar" collapsible="none" className="border-r">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <Avatar className="h-8 w-8 border-2 border-primary">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs">
                            SA
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                        <span className="font-semibold text-sm">Super Admin</span>
                        <span className="text-xs text-muted-foreground">Administrator</span>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronDown className="h-4 w-4" />
                                <span className="sr-only">Profile menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <UserCircle2 className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarHeader>
            
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={pathname === item.href}
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/">
                                <Home />
                                <span>Back to Home</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}