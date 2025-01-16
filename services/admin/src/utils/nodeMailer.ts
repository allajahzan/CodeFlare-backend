import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ahsanallajpk22@gmail.com",
        pass: "iyiuvrdfvfrspksj",
    },
});

export const sendEmail = (email: string, callback: any) => {
    const mailOptions = {
        from: "ahsanallajpk22@gmail.com",
        to: email,
        subject: "Your accound has been deleted",
        html: `<p>Your CRUD account has been deleted by admin. if you want create a new accound with same mail<p>`,
    };

    transporter.sendMail(mailOptions, function (error: any, info: any) {
        if (error) {
            console.error(error);
            callback(error);
        } else {
            console.log("Email has been sent to user's email");
            callback(null, info);
        }
    });
};
