import axios from "axios"

export const sendOtp = async (email: string) => {
    const res = await axios.post(`https://real-estate-apis.vercel.app/api/user/otp`, {
        email: email,
    });

    if (res.status == 200) {
        return true;
    } else {
        return false;
    }
};
