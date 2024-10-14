import axiosClient from "./axiosClient";

const payment = {
    generateQrCode(qrData) {
        const url = "/api/qr/generate";
        return axiosClient.post(url, qrData);
    }
}

export default payment;