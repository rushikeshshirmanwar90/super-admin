"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Loader2, Building2, Mail } from 'lucide-react'
import Link from 'next/link'
import { adminAPI, clientAPI } from '@/lib/api'
import { Client } from '@/lib/types'
import { toast } from 'react-toastify'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const NewAdminPage = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    clientId: '',
  })
  const [licenseValue, setLicenseValue] = useState<number>(1)
  const [licenseUnit, setLicenseUnit] = useState<'days' | 'months' | 'years'>('days')
  const [isLifetime, setIsLifetime] = useState(false)

  // Email verification state
  const [emailVerificationStep, setEmailVerificationStep] = useState<'form' | 'verification' | 'verified'>('form')
  const [verificationCode, setVerificationCode] = useState('')
  const [sentVerificationCode, setSentVerificationCode] = useState('')
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setIsLoadingClients(true)
      const response = await clientAPI.getAll()
      const clientData = response.data.data || []
      setClients(clientData)
    } catch (error) {
      console.error('Error fetching clients:', error)
      toast.error('Failed to fetch clients')
    } finally {
      setIsLoadingClients(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleSendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter an email address')
      return
    }

    setIsSendingVerification(true)
    try {
      const code = generateVerificationCode()
      
      // Import and use the sendOtp function
      const { sendOtp } = await import('@/lib/functions/send-otp')
      const success = await sendOtp(formData.email, parseInt(code))
      
      if (success) {
        setSentVerificationCode(code)
        toast.success(`Verification code sent to ${formData.email}`)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (emailVerificationStep !== 'verified') {
      toast.error('Please verify your email first')
      return
    }

    setIsSubmitting(true)

    try {
      await adminAPI.create(formData)
      toast.success('Admin created successfully!')
      router.push('/admins')
    } catch (error: any) {
      console.error('Error creating admin:', error)
      toast.error(error.response?.data?.message || 'Failed to create admin')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSelectedClient = () => {
    return clients.find(client => client._id === formData.clientId)
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admins">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Add New Admin</h1>
            <p className="text-slate-600 mt-1">Create a new administrator for a client</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Admin Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Verification Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Verification
                {emailVerificationStep === 'verified' && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    ✓ Verified
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailVerificationStep === 'form' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        disabled={isSendingVerification}
                        className="flex-1"
                        required
                      />
                      <Button
                        type="button"
                        onClick={handleSendVerification}
                        disabled={!formData.email || isSendingVerification}
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
                  </div>
                  <p className="text-xs text-slate-500">
                    We'll send a verification code to this email address
                  </p>
                </div>
              )}

              {emailVerificationStep === 'verification' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        Verification Code Sent
                      </span>
                    </div>
                    <p className="text-sm text-amber-700">
                      We've sent a 6-digit code to <strong>{formData.email}</strong>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="verificationCode">Enter Verification Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="verificationCode"
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
                      <p className="text-xs text-green-600">{formData.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Client <span className="text-red-500">*</span>
                </label>
                {isLoadingClients ? (
                  <div className="flex items-center gap-2 p-4 border border-slate-300 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-slate-500">Loading clients...</span>
                  </div>
                ) : (
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name} - {client.city}, {client.state}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected Client Preview */}
              {formData.clientId && getSelectedClient() && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getSelectedClient()?.logo} alt="Client Logo" />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getSelectedClient()?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-slate-900">{getSelectedClient()?.name}</h3>
                      <p className="text-sm text-slate-600">
                        {getSelectedClient()?.city}, {getSelectedClient()?.state}
                      </p>
                      <p className="text-xs text-slate-500">{getSelectedClient()?.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                isLoadingClients || 
                emailVerificationStep !== 'verified'
              } 
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                'Create Admin'
              )}
            </Button>
            <Link href="/admins" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

export default NewAdminPage