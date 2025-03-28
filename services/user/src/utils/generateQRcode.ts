import QRCode from "qrcode";

/**
 * Generates a QR code that will redirect to the check in/out page when scanned
 * @param userId The id of the user for which the QR code is being generated
 * @returns A base64 encoded string of the QR code image
 * @throws An error if there is a problem generating the QR code
 */
export const generateQRcode = async (userId: string) => {
    try {
        const qrCodeData = `http://localhost:3003/student/attendence/check-in-out?userId=${userId}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);

        return qrCodeImage;
    } catch (err: unknown) {
        throw err;
    }
};
