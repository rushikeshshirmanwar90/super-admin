import axios from "axios"

export const sendOtp = async (email: string) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_DOMAIN}/api/user/otp`, {
        email: email,
    });

    if (res.status == 200) {
        return true;
    } else {
        return false;
    }
};
