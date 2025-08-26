const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
export default generateOtp;