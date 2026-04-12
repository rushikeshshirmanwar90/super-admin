import type { Metadata } from "next";
import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "./globals.css";

import { AdminSidebar } from "@/components/AdminSideBar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Super Admin Dashboard",
  description: "Manage all clients and licenses for your real estate platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          draggable
          theme="light"
          transition={Bounce}
        />

        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AdminSidebar />
            <main className="flex-1 flex flex-col">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white sticky top-0 z-10">
                <SidebarTrigger className="-ml-1 hover:bg-slate-100" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2 flex-1">
                  <h1 className="text-lg font-semibold text-slate-900">Super Admin Dashboard</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 hidden md:block">Press Ctrl+B to toggle</span>
                </div>
              </header>
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
