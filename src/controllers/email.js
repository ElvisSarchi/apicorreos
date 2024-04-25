/* eslint-disable import/no-cycle */
import AWS from "aws-sdk"
import "dotenv/config"
import nodemailer from "nodemailer"
const charsetFormat = `UTF-8`

const transporter = nodemailer.createTransport({
  SES: new AWS.SES({
    apiVersion: `2010-12-01`,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_IAM_USER_NAME,
      secretAccessKey: process.env.AWS_IAM_PASSWORD,
    },
  }),
})

const senderMode = {
  plainText: `plainText`,
  template: `template`,
}
const plainTextParams = ({
  subject = ``,
  body = ``,
  charset = charsetFormat,
}) => ({
  Message: {
    Body: {
      Html: {
        Charset: charset,
        Data: body,
      },
    },
    Subject: {
      Charset: charset,
      Data: subject,
    },
  },
})
const templateParams = ({ templateName = ``, template = `` }) => ({
  Template: templateName,
  TemplateData: JSON.stringify(template),
})
export function sendEmail({
  mode = senderMode.plainText,
  receivers = [],
  receiver = null,
  subject = ``,
  body = ``,
  templateName = ``,
  template = ``,
}) {
  try {
    const AWS_SES = new AWS.SES()
    const params = {
      Source: `notificaciones${process.env.AWS_MAIL_SENDER}`,
      Destination: {
        ToAddresses: receiver ? [receiver] : receivers,
      },
      ReplyToAddresses: [],
      ...(mode === senderMode.plainText && plainTextParams({ subject, body })),
      ...(mode === senderMode.template &&
        templateParams({ templateName, template })),
    }
    const toAddresses = params.Destination.ToAddresses ?? []
    const validEmails = toAddresses.filter((email) => {
      const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
      return regex.test(email)
    });
    params.Destination.ToAddresses = validEmails
    if (validEmails.length === 0) {
      return false
    }
    return AWS_SES.sendEmail(params).promise()
  } catch (error) {
    console.log(`error`, error)
    return error
  }
}

export async function sendEmailNodemailer({
  from = `SaciAPP Documentos`,
  to = ``,
  subject = ``,
  html = ``,
  attachments = [],
  sender = `no-reply${process.env.AWS_MAIL_SENDER}`,
}) {
  try {
    await transporter.sendMail({
      from: `"${from}" <${sender}>`,
      to,
      subject,
      html,
      attachments,
    })
    return true
  } catch (error) {
    console.log(`error`, error)
    return false
  }
}
