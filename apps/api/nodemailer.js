const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saeidrahmi@gmail.com',
    pass: 'jzuffrztvamekuwm',
  },
});

function sendVerificationEmail(userId, token) {
  const mailOptions = {
    from: 'Ontsoft Web System',
    to: userId,
    subject: 'Account setup - Verify your email address',
    html: `<div style="border: solid 1px blue; padding: 30px">
            <h2>Verify your email address</h2>
            <p>Hello,</p>

            <p>
              You're almost done setting up your account. Select verify email below and
              we'll bring you back to Ontsoft for some final details.
            </p>
            <p>
              <a href="http://localhost:4200/register/${token}">Verify Email</a>
            </p>
            <p>
              For your security, this link will expire 48 hours from the time this email
              was sent.
            </p>
            <p>Ontsoft Team</p>
          </div>
          `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
}

module.exports = { sendVerificationEmail };
