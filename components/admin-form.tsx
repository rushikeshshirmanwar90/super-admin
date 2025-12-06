"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, CheckCircle } from "lucide-react"
import { errorToast, successToast } from "./toast"
import axios from "axios"
import { sendOtp } from "@/lib/functions/send-otp"
import { AdminData } from "@/lib/types"

interface AdminFormProps {
    onAdminAdded: (admin: AdminData) => void
    clientId: string
    initialData?: AdminData | null
    onClose?: () => void
}

export function AdminForm({ onAdminAdded, clientId, initialData = null, onClose }: AdminFormProps) {
    const [formData, setFormData] = useState<AdminData>(
        initialData ?? {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            clientId: clientId,
        }
    )

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEmailVerified, setIsEmailVerified] = useState(!!initialData)
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [otp, setOtp] = useState("")
    const [generatedOtp, setGeneratedOtp] = useState("")
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        if (name === "email" && !initialData) {
            setIsEmailVerified(false)
            setShowOtpInput(false)
            setOtp("")
        }
    }

    const handleVerifyEmail = async () => {
        if (!formData.email) return

        setIsVerifyingEmail(true)
        try {
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
            await new Promise((resolve) => setTimeout(resolve, 500))

            if (otp === generatedOtp) {
                setIsEmailVerified(true)
                setShowOtpInput(false)
                successToast("Email verified successfully!")
            } else {
                errorToast("Invalid OTP. Please try again.")
            }
        } catch (error) {
            console.error("Error verifying OTP:", error)
            errorToast("Error verifying OTP. Please try again.")
        } finally {
            setIsVerifyingOtp(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            let res

            if (initialData?._id) {
                // Update existing admin
                res = await axios.put(
                    `${process.env.NEXT_PUBLIC_DOMAIN}/api/admin?id=${initialData._id}`,
                    formData
                )
                successToast("Admin updated successfully!")
            } else {
                // Create new admin
                res = await axios.post(
                    `${process.env.NEXT_PUBLIC_DOMAIN}/api/admin`,
                    formData
                )
                successToast("Admin added successfully!")
            }

            const adminData = res.data?.data || formData

            onAdminAdded(adminData)

            // Reset form if adding new admin
            if (!initialData) {
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: "",
                    clientId: clientId,
                })
                setIsEmailVerified(false)
                setShowOtpInput(false)
                setOtp("")
                setGeneratedOtp("")
            }

            if (onClose) {
                onClose()
            }
        } catch (error: unknown) {
            console.error("Error submitting admin:", error)

            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message
                    || error.response?.data?.error
                    || error.message
                    || "Failed to save admin"

                errorToast(errorMessage)
            } else if (error instanceof Error) {
                errorToast(error.message)
            } else {
                errorToast("Unexpected error occurred")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter first name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter last name"
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

            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || (!isEmailVerified && !initialData)}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {initialData ? "Updating Admin..." : "Adding Admin..."}
                    </>
                ) : initialData ? (
                    "Update Admin"
                ) : (
                    "Add Admin"
                )}
            </Button>

            {!isEmailVerified && !initialData && formData.email && (
                <p className="text-sm text-muted-foreground text-center">
                    Please verify your email address to enable form submission
                </p>
            )}
        </form>
    )
}
