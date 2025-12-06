import axios from "axios"
import { Domain } from "domain";

export const sendOtp = async (email: string, OTP: number) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/otp`, {
        email: email,
        OTP: OTP,
    });

    if (res.status === 200) {
        return true;
    } else {
        return false;
    }
};