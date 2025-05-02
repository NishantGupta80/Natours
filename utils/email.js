const nodemailer=require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text'); 


module.exports = class Email {
  constructor(user,url){
    this.to = user.email;
    this.url=url;
    this.firstName = user.name.split(' ')[0];
    this.from = `${process.env.EMAIL_FROM}`;

  }


newTransport(){
  if(process.env.NODE_ENV === 'production')
  {
    // sendGrid
    return nodemailer.createTransport({
      service : 'SendGrid',
      auth:{
          user:process.env.SENDGRID_APIKEY,
          pass:process.env.SENDGRID_PASSWORD
      }
      });
  }
  else
   return nodemailer.createTransport({
      host:process.env.EMAIL_HOST,
      port:process.env.EMAIL_PORT,
      auth:{
          user:process.env.EMAIL_USERNAME,
          pass:process.env.EMAIL_PASSWORD
      }
      });
}


  async send(template,subject){
  // sends an Actual Email

  // 1) render HTML based On a Pug template
  const html =  pug.renderFile(`${__dirname}/../views/Emails/${template}.pug`,{
    firstName:this.firstName,
    url:this.url,
    subject
   });







 // 2) Define the Mail Options
 const mailOptions = {
  from : this.from,
  to: this.to,
  subject:subject,
  html:html,
  text: htmlToText.htmlToText(html),
}

// create a Transport and sendEmail
  await this.newTransport().sendMail(mailOptions);

 }

  async sendWelcome(){
   await this.send("welcome","welCome to Natours Family");
 }

 async sendPasswordReset(){
  await this.send('PasswordReset', "Your Password Reset Token Valid For 10 Minutes");
 }
 
};

