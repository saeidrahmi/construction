const nodemailer = require('nodemailer');
import { EnvironmentInfo } from '../../libs/common/src/models/common';
const env = new EnvironmentInfo();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'saeidrahmi@gmail.com',
    pass: 'jzuffrztvamekuwm',
  },
});

function sendVerificationEmail(userId, token) {
  return new Promise((resolve, reject) => {
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
                  For your security, this link will expire ${
                    env.userRegistrationTokenExpiry() / 3600
                  } hours from the time this email
                  was sent.
                </p>
                <p>Ontsoft Team</p>
              </div>
            `,
    };

    transporter
      .sendMail(mailOptions)
      .then((info) => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function sendPasswordResetEmail(userId, token) {
  var mailOptions = {
    from: 'Ontsoft Web System',
    to: userId,
    subject: 'Account reset- Verify your email address',
    html: `<div style="border: solid 1px blue; padding: 30px">
                <h2>Reset your password</h2>
                <p>Hello,</p>

                <p>
                  You're almost done resetting your password. please click the link below.
                </p>
                <p>
                  <a href="http://localhost:4200/complete-reset-password/${token}"> Reset Password</a>
                </p>
                <p>
                  For your security, this link will expire ${
                    env.getPasswordResetExpiry() / 3600
                  }  hours from the time this email
                  was sent.
                </p>
                <p>Ontsoft Team</p>
              </div>
              `,
  };
}
function sendTemporaryPasswordEmail(userId, password) {
  var mailOptions = {
    from: 'Ontsoft Web System',
    to: userId,
    subject: 'Temporary Password',
    html: `<div style="border: solid 1px blue; padding: 30px">
                <h2>Login with your  temporary password</h2>
                <p>Hello,</p>

                <p>
                  Please login to your account. please click the link below.
                </p>
                <br>
                Your temporary password is ${password}
                <p>
                  <a href="http://localhost:4200/login">Login</a>
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
module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTemporaryPasswordEmail,
};
