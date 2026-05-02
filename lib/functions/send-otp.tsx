import axios from "axios"

export const sendOtp = async (email: string, OTP: number) => {
    try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/otp`, {
            email: email,
            OTP: OTP,
        });

        return res.status === 200;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
    }
};