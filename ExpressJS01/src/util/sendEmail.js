const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"TrendyBags" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: htmlContent,
        });

        console.log(">>> Gửi email thành công tới: ", email);
        return true;
    } catch (error) {
        console.error(">>> Lỗi khi gửi email: ", error);
        return false;
    }
};

module.exports = sendEmail;