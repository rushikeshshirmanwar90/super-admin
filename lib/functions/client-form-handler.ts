"use client";

import axios from "axios";
import { errorToast, successToast } from "@/components/toast";
import { handleImageUpload, removeImage } from "@/lib/image-upload";

// Types
export interface ClientData {
  name: string;
  phoneNumber: string;
  email: string;
  city: string;
  state: string;
  address: string;
  logo: string;
}

// Input change
export const handleInputChange =
  (
    setFormData: React.Dispatch<React.SetStateAction<ClientData>>,
    setIsEmailVerified: React.Dispatch<React.SetStateAction<boolean>>,
    setShowOtpInput: React.Dispatch<React.SetStateAction<boolean>>,
    setOtp: React.Dispatch<React.SetStateAction<string>>
  ) =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setIsEmailVerified(false);
      setShowOtpInput(false);
      setOtp("");
    }
  };

// Verify email
export const handleVerifyEmail = async (
  email: string,
  setGeneratedOtp: React.Dispatch<React.SetStateAction<string>>,
  setShowOtpInput: React.Dispatch<React.SetStateAction<boolean>>,
  setIsVerifyingEmail: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!email) return;
  setIsVerifyingEmail(true);

  try {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    console.log(`[v0] OTP sent to ${email}: ${newOtp}`);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setShowOtpInput(true);
    alert(`OTP sent to ${email}. (For demo: ${newOtp})`);
  } catch (error) {
    console.error("Error sending OTP:", error);
    alert("Error sending OTP. Please try again.");
  } finally {
    setIsVerifyingEmail(false);
  }
};

// Verify OTP
export const handleVerifyOtp = async (
  otp: string,
  generatedOtp: string,
  setIsEmailVerified: React.Dispatch<React.SetStateAction<boolean>>,
  setShowOtpInput: React.Dispatch<React.SetStateAction<boolean>>,
  setIsVerifyingOtp: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!otp) return;
  setIsVerifyingOtp(true);

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (otp === generatedOtp) {
      setIsEmailVerified(true);
      setShowOtpInput(false);
      alert("Email verified successfully!");
    } else {
      alert("Invalid OTP. Please try again.");
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    alert("Error verifying OTP. Please try again.");
  } finally {
    setIsVerifyingOtp(false);
  }
};

// Upload logo
export const handleLogoUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setLogoImages: React.Dispatch<React.SetStateAction<string[]>>,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
  setFormData: React.Dispatch<React.SetStateAction<ClientData>>
) => {
  const urls = await handleImageUpload(e, setLogoImages, setIsUploading);
  if (urls && urls.length > 0) {
    setFormData((prev) => ({
      ...prev,
      logo: urls[0],
    }));
  }
};

// Remove logo
export const handleRemoveLogo = (
  index: number,
  setLogoImages: React.Dispatch<React.SetStateAction<string[]>>,
  setFormData: React.Dispatch<React.SetStateAction<ClientData>>
) => {
  removeImage(index, setLogoImages);
  setFormData((prev) => ({ ...prev, logo: "" }));
};

// Submit form
export const handleSubmit = async (
  e: React.FormEvent,
  formData: ClientData,
  setFormData: React.Dispatch<React.SetStateAction<ClientData>>,
  setLogoImages: React.Dispatch<React.SetStateAction<string[]>>,
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>
) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    console.log("Sending client data:", formData);

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/clients`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (res.status === 200) {
      successToast("Client added successfully!");
      alert("Client added successfully!");
    } else {
      errorToast("Something went wrong, can't add the client.");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setFormData({
      name: "",
      phoneNumber: "",
      email: "",
      city: "",
      state: "",
      address: "",
      logo: "",
    });
    setLogoImages([]);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.data?.message) {
        errorToast(error.response.data.message);
        alert(error.response.data.message);
      } else if (error.response) {
        errorToast(`Request failed with status ${error.response.status}`);
        alert(`Request failed with status ${error.response.status}`);
      } else {
        errorToast(error.message || "Something went wrong.");
        alert(error.message || "Something went wrong.");
      }
    } else {
      console.error("Unexpected error:", error);
      errorToast("Unexpected error occurred.");
      alert("Unexpected error occurred.");
    }
  } finally {
    setIsSubmitting(false);
  }
};
