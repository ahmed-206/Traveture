import nodemailer from 'nodemailer';

let transporter;

const createTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

await createTransporter();

export const sendEmail = async ({ email, subject, message }) => {
  const info = await transporter.sendMail({
    from: '"Ahmed Ramadan" <no-reply@traveture.com>',
    to: email,
    subject: subject,
    text: message,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
};
