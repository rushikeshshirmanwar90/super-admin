"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ImagePlus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { clientAPI } from '@/lib/api'
import { toast } from 'react-toastify'
import Image from 'next/image'

const NewClientPage = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    city: '',
    state: '',
    address: '',
    licenseDays: '',
    logo: '',
  })
  const [licenseValue, setLicenseValue] = useState<number>(1)
  const [licenseUnit, setLicenseUnit] = useState<'days' | 'months' | 'years'>('days')
  const [isLifetime, setIsLifetime] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Calculate license days based on value and unit
  const calculateLicenseDays = (value: number, unit: 'days' | 'months' | 'years'): number => {
    if (unit === 'months') return value * 31
    if (unit === 'years') return value * 365
    return value
  }

  const handleLicenseValueChange = (value: number) => {
    setLicenseValue(value)
    if (!isLifetime) {
      const days = calculateLicenseDays(value, licenseUnit)
      setFormData(prev => ({ ...prev, licenseDays: days.toString() }))
    }
  }

  const handleLicenseUnitChange = (unit: 'days' | 'months' | 'years') => {
    setLicenseUnit(unit)
    if (!isLifetime) {
      const days = calculateLicenseDays(licenseValue, unit)
      setFormData(prev => ({ ...prev, licenseDays: days.toString() }))
    }
  }

  const handleLifetimeToggle = (lifetime: boolean) => {
    setIsLifetime(lifetime)
    if (lifetime) {
      setFormData(prev => ({ ...prev, licenseDays: '-1' }))
    } else {
      const days = calculateLicenseDays(licenseValue, licenseUnit)
      setFormData(prev => ({ ...prev, licenseDays: days.toString() }))
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    
    setIsUploadingImage(true)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', e.target.files[0])
      uploadFormData.append('upload_preset', 'realEstate')

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dlcq8i2sc/image/upload`,
        {
          method: 'POST',
          body: uploadFormData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Cloudinary error:', errorData)
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      const imageUrl = data.secure_url
      
      setFormData(prev => ({ ...prev, logo: imageUrl }))
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload image. Please try again.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData: any = {
        name: formData.name,
        email: formData.email,
        phoneNumber: Number(formData.phoneNumber),
        city: formData.city,
        state: formData.state,
        address: formData.address,
      }

      if (formData.logo) submitData.logo = formData.logo
      if (formData.licenseDays) submitData.license = Number(formData.licenseDays)

      await clientAPI.create(submitData)
      toast.success('Client created successfully!')
      router.push('/clients')
    } catch (error: any) {
      console.error('Error creating client:', error)
      toast.error(error.response?.data?.message || 'Failed to create client')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Add New Client</h1>
            <p className="text-slate-600 mt-1">Create a new client account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>License Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lifetime Toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="lifetimeAccess"
                    checked={isLifetime}
                    onChange={(e) => handleLifetimeToggle(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="lifetimeAccess" className="cursor-pointer">
                    <div className="font-semibold text-purple-700">Lifetime Access</div>
                    <div className="text-xs text-purple-600">Grant unlimited access with no expiration</div>
                  </label>
                </div>
                {isLifetime && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    ∞ Lifetime
                  </Badge>
                )}
              </div>

              {!isLifetime && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={licenseValue}
                        onChange={(e) => handleLicenseValueChange(Number(e.target.value))}
                        required
                        placeholder="Enter duration"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={licenseUnit}
                        onChange={(e) => handleLicenseUnitChange(e.target.value as 'days' | 'months' | 'years')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="days">Days</option>
                        <option value="months">Months (31 days each)</option>
                        <option value="years">Years (365 days each)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-slate-700">
                      Total License Duration: <span className="font-semibold text-blue-700">{formData.licenseDays || 0} days</span>
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5" />
                Client Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-square w-80 max-w-full overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                {formData.logo ? (
                  <Image
                    width={320}
                    height={320}
                    src={formData.logo}
                    alt="Client Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">No logo uploaded</p>
                      <p className="text-xs text-slate-400 mt-1">Click below to upload</p>
                    </div>
                  </div>
                )}

                <label className="absolute bottom-3 right-3 cursor-pointer">
                  <div className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700">
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    <span>{isUploadingImage ? "Uploading..." : formData.logo ? "Change Logo" : "Upload Logo"}</span>
                  </div>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploadingImage}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Recommended: Square image, at least 200x200px. Max size: 5MB
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploadingImage} 
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Client'
              )}
            </Button>
            <Link href="/clients" className="flex-1">
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

export default NewClientPage
