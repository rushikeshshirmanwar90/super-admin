import { ClientsTable } from '@/components/client-table'
import React from 'react'

const Page = () => {
  return (
    <main className="min-h-screen bg-background p-8 w-full">
      <div className="mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Add New Client</h1>
          <p className="text-muted-foreground">Fill in the client information below</p>
        </div>
        <ClientsTable />
      </div>
    </main>
  )
}

export default Page
