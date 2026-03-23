"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Calendar, Clock, Infinity, Plus, RotateCcw } from "lucide-react"
import axios from "axios"
import { errorToast, successToast } from "./toast"

interface LicenseFormProps {
    isOpen: boolean
    onClose: () => void
    clientId: string
    clientName: string
    currentLicense: number
    onLicenseUpdated: (newLicense: number, isActive: boolean, expiryDate?: string) => void
}

export function LicenseForm({ 
    isOpen, 
    onClose, 
    clientId, 
    clientName, 
    currentLicense, 
    onLicenseUpdated 
}: LicenseFormProps) {
    const [licenseValue, setLicenseValue] = useState<string>("")
    const [licenseUnit, setLicenseUnit] = useState<'days' | 'months' | 'years' | 'lifetime'>('months')
    const [actionType, setActionType] = useState<'add' | 'set'>('add')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (licenseUnit !== 'lifetime' && (!licenseValue || parseInt(licenseValue) <= 0)) {
            errorToast("Please enter a valid license value")
            return
        }

        setIsLoading(true)

        try {
            const endpoint = actionType === 'add' 
                ? `${process.env.NEXT_PUBLIC_DOMAIN}/api/license`
                : `${process.env.NEXT_PUBLIC_DOMAIN}/api/license`

            const method = actionType === 'add' ? 'POST' : 'PUT'

            const requestData = {
                clientId,
                licenseValue: licenseUnit === 'lifetime' ? 1 : parseInt(licenseValue),
                licenseUnit
            }

            console.log('License update request:', { method, endpoint, requestData })

            const response = await axios({
                method,
                url: endpoint,
                data: requestData
            })

            if (response.data.success) {
                const { license, isLicenseActive, licenseExpiryDate } = response.data.data
                
                successToast(response.data.message)
                onLicenseUpdated(license, isLicenseActive, licenseExpiryDate)
                
                // Reset form
                setLicenseValue("")
                setLicenseUnit('months')
                setActionType('add')
                onClose()
            } else {
                errorToast(response.data.message || "Failed to update license")
            }
        } catch (error: any) {
            console.error("License update error:", error)
            if (axios.isAxiosError(error)) {
                errorToast(error.response?.data?.message || "Failed to update license")
            } else {
                errorToast("Failed to update license. Please try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleRevokeLicense = async () => {
        setIsLoading(true)

        try {
            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_DOMAIN}/api/license?clientId=${clientId}`
            )

            if (response.data.success) {
                const { license, isLicenseActive, licenseExpiryDate } = response.data.data
                
                successToast("License revoked successfully")
                onLicenseUpdated(license, isLicenseActive, licenseExpiryDate)
                onClose()
            } else {
                errorToast(response.data.message || "Failed to revoke license")
            }
        } catch (error: any) {
            console.error("License revoke error:", error)
            if (axios.isAxiosError(error)) {
                errorToast(error.response?.data?.message || "Failed to revoke license")
            } else {
                errorToast("Failed to revoke license. Please try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const getCurrentLicenseDisplay = () => {
        if (currentLicense === -1) return "Lifetime Access"
        if (currentLicense === 0) return "Expired"
        return `${currentLicense} days remaining`
    }

    const getConversionPreview = () => {
        if (licenseUnit === 'lifetime') return "Lifetime Access"
        if (!licenseValue || parseInt(licenseValue) <= 0) return ""
        
        const value = parseInt(licenseValue)
        let days = 0
        
        switch (licenseUnit) {
            case 'days':
                days = value
                break
            case 'months':
                days = value * 31
                break
            case 'years':
                days = value * 365
                break
        }
        
        return `= ${days} days`
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Manage License - {clientName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current License Status */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Current License</p>
                                <p className={`text-lg font-bold ${
                                    currentLicense === -1 ? 'text-green-600' :
                                    currentLicense === 0 ? 'text-red-600' :
                                    currentLicense <= 7 ? 'text-orange-600' : 'text-blue-600'
                                }`}>
                                    {getCurrentLicenseDisplay()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Status</p>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    currentLicense === -1 ? 'bg-green-100 text-green-800' :
                                    currentLicense === 0 ? 'bg-red-100 text-red-800' :
                                    currentLicense <= 7 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {currentLicense === -1 ? 'Lifetime' :
                                     currentLicense === 0 ? 'Expired' :
                                     currentLicense <= 7 ? 'Expiring Soon' : 'Active'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Action Type */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Action</Label>
                            <RadioGroup
                                value={actionType}
                                onValueChange={(value: 'add' | 'set') => setActionType(value)}
                                className="flex gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="add" id="add" />
                                    <Label htmlFor="add" className="flex items-center gap-2 cursor-pointer">
                                        <Plus className="h-4 w-4" />
                                        Add to current
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="set" id="set" />
                                    <Label htmlFor="set" className="flex items-center gap-2 cursor-pointer">
                                        <RotateCcw className="h-4 w-4" />
                                        Replace current
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* License Unit */}
                        <div className="space-y-2">
                            <Label htmlFor="unit">License Type</Label>
                            <Select value={licenseUnit} onValueChange={(value: any) => setLicenseUnit(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="days">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Days
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="months">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Months (31 days each)
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="years">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Years (365 days each)
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="lifetime">
                                        <div className="flex items-center gap-2">
                                            <Infinity className="h-4 w-4" />
                                            Lifetime Access
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* License Value */}
                        {licenseUnit !== 'lifetime' && (
                            <div className="space-y-2">
                                <Label htmlFor="value">
                                    {licenseUnit === 'days' ? 'Number of Days' :
                                     licenseUnit === 'months' ? 'Number of Months' :
                                     'Number of Years'}
                                </Label>
                                <div className="space-y-2">
                                    <Input
                                        id="value"
                                        type="number"
                                        min="1"
                                        value={licenseValue}
                                        onChange={(e) => setLicenseValue(e.target.value)}
                                        placeholder={`Enter ${licenseUnit}`}
                                        required
                                    />
                                    {getConversionPreview() && (
                                        <p className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded">
                                            {licenseValue} {licenseUnit} {getConversionPreview()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        {actionType === 'add' ? (
                                            <Plus className="mr-2 h-4 w-4" />
                                        ) : (
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                        )}
                                        {actionType === 'add' ? 'Add License' : 'Set License'}
                                    </>
                                )}
                            </Button>

                            {currentLicense > 0 && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleRevokeLicense}
                                    disabled={isLoading}
                                >
                                    Revoke
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}