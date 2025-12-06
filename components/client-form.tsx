"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Loader2, Mail, CheckCircle } from "lucide-react"
import { handleImageUpload, removeImage } from "@/lib/image-upload"
import Image from "next/image"
import { errorToast, successToast } from "./toast"
import axios from "axios"
import { ClientData } from "@/lib/types"
import { sendOtp } from "@/lib/functions/send-otp"

interface ClientFormProps {
    onClientAdded: (client: ClientData) => void
    initialData?: ClientData | null
}

export function ClientForm({ onClientAdded, initialData = null }: ClientFormProps) {
    const [formData, setFormData] = useState<ClientData>(
        initialData ?? {
            name: "",
            phoneNumber: "",
            email: "",
            city: "",
            state: "",
            address: "",
            logo: "",
        }
    )

    const [logoImages, setLogoImages] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isEmailVerified, setIsEmailVerified] = useState(false)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otp, setOtp] = useState("")
    const [generatedOtp, setGeneratedOtp] = useState("")
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (name === "email") {
            setIsEmailVerified(false)
            setShowOtpInput(false)
            setOtp("")
        }
    }

    const handleVerifyEmail = async () => {
        if (!formData.email) return

        setIsVerifyingEmail(true)
        try {
            // Generate 6-digit OTP
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString()
            setGeneratedOtp(newOtp)

            await sendOtp(formData.email, Number(newOtp))

            setShowOtpInput(true)
            successToast(`OTP sent to ${formData.email}. Check your email!`)
        } catch (error) {
            console.error("Error sending OTP:", error)
            errorToast("Failed to send OTP. Please try again.")
        } finally {
            setIsVerifyingEmail(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (!otp) return

        setIsVerifyingOtp(true)
        try {
            // Simulate OTP verification
            await new Promise((resolve) => setTimeout(resolve, 500))

            if (otp === generatedOtp) {
                setIsEmailVerified(true)
                setShowOtpInput(false)
                alert("Email verified successfully!")
            } else {
                alert("Invalid OTP. Please try again.")
            }
        } catch (error) {
            console.error("Error verifying OTP:", error)
            alert("Error verifying OTP. Please try again.")
        } finally {
            setIsVerifyingOtp(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const urls = await handleImageUpload(e, setLogoImages, setIsUploading)
        if (urls && urls.length > 0) {
            setFormData((prev) => ({
                ...prev,
                logo: urls[0], // Use the first uploaded image as logo
            }))
        }
    }

    const handleRemoveLogo = (index: number) => {
        removeImage(index, setLogoImages)
        setFormData((prev) => ({
            ...prev,
            logo: "",
        }))
    }

    // Reset logoImages if initialData changes
    useEffect(() => {
        if (initialData) {
            setLogoImages(initialData.logo ? [initialData.logo] : [])
        }
    }, [initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            let res

            if (initialData?._id) {
                // Update existing client
                res = await axios.put(
                    `${process.env.NEXT_PUBLIC_DOMAIN}/api/client?id=${initialData._id}`,
                    formData
                )
                successToast("Client updated successfully!")
            } else {
                // Create new client
                res = await axios.post(
                    `${process.env.NEXT_PUBLIC_DOMAIN}/api/client`,
                    formData
                )
                successToast("Client added successfully!")
            }

            // Use response data if available, otherwise use formData
            const clientData = res.data?.clientData || res.data?.client || res.data || formData

            // Call parent handler with the response data
            onClientAdded(clientData)

            // Reset form after successful submission
            setFormData({
                name: "",
                phoneNumber: "",
                email: "",
                city: "",
                state: "",
                address: "",
                logo: "",
            })
            setLogoImages([])
            setIsEmailVerified(false)
            setShowOtpInput(false)
            setOtp("")
            setGeneratedOtp("")
        } catch (error: unknown) {
            console.error("Error adding client:", error)

            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message
                    || error.response?.data?.error
                    || `Request failed with status ${error.response?.status}`
                    || error.message
                    || "Failed to add client. Please try again."

                errorToast(errorMessage)
            } else if (error instanceof Error) {
                errorToast(error.message || "Something went wrong.")
            } else {
                errorToast("Unexpected error occurred.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full min-h-screen p-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter client name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number *</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email *{" "}
                                {(isEmailVerified || initialData) && (
                                    <CheckCircle className="inline h-4 w-4 text-green-500 ml-1" />
                                )}
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter email address"
                                    disabled={isEmailVerified || !!initialData}
                                    className="flex-1"
                                />
                                {!isEmailVerified && !initialData && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleVerifyEmail}
                                        disabled={!formData.email || isVerifyingEmail}
                                    >
                                        {isVerifyingEmail ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Verify
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {showOtpInput && !initialData && (
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={otp.length !== 6 || isVerifyingOtp}
                                    >
                                        {isVerifyingOtp ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            "Verify OTP"
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Location Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter city"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter state"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter full address"
                                rows={3}
                            />
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="logo">Company Logo</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6">
                                {logoImages.length === 0 ? (
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                Click to upload or drag and drop your logo
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PNG, JPG, GIF up to 10MB
                                            </p>
                                        </div>
                                        <Input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={isUploading}
                                            className="mt-4"
                                        />
                                        {isUploading && (
                                            <div className="flex items-center justify-center mt-4">
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                <span className="text-sm text-muted-foreground">
                                                    Uploading...
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {logoImages.map((url, index) => (
                                            <div key={index} className="relative inline-block">
                                                <Image
                                                    width={500}
                                                    height={500}
                                                    src={url || "/placeholder.svg"}
                                                    alt={`Logo ${index + 1}`}
                                                    className="h-32 w-32 object-cover rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                    onClick={() => handleRemoveLogo(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="mt-4">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={isUploading}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting || isUploading || (!isEmailVerified && !initialData)}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {initialData ? "Updating Client..." : "Adding Client..."}
                                </>
                            ) : initialData ? (
                                "Update Client"
                            ) : (
                                "Add Client"
                            )}
                        </Button>

                        {!isEmailVerified && !initialData && formData.email && (
                            <p className="text-sm text-muted-foreground text-center">
                                Please verify your email address to enable form submission
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}