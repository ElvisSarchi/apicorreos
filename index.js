/* eslint-disable semi */
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import logger from "morgan";
import configAWS from "./config/aws";
import { sendEmailNodemailer } from "./src/controllers/email";

configAWS();
const app = express();
app.use(cors());
app.use(logger(`dev`));
app.use(express.json({ limit: `50mb` }));
app.use(express.urlencoded({ limit: `50mb`, extended: true }));
app.use(`/public`, express.static(path.join(__dirname, `public`)));

app.post(`/sendEmail`, async (req, res) => {
  try {
    const {
      from,
      to,
      subject,
      NOMBRE_SUPERVISOR,
      TIPO_USUARIO,
      RUC,
      RAZON_SOCIAL,
    } = req.body;
    //get tempalte
    let template = fs.readFileSync(
      `./src/template/autorizarcliente.html`,
      `utf8`
    );
    template = template.replace(`{{NOMBRE_SUPERVISOR}}`, NOMBRE_SUPERVISOR);
    template = template.replace(`{{TIPO_USUARIO}}`, TIPO_USUARIO);
    template = template.replace(`{{RUC}}`, RUC);
    template = template.replace(`{{RAZON_SOCIAL}}`, RAZON_SOCIAL);
    //get image from public
    const image = fs.readFileSync(`./public/images/nova.png`, `base64`);
    const resp = await sendEmailNodemailer({
      from,
      to,
      subject,
      html: template,
      attachments: [
        {
          filename: `nova.png`,
          path: `./public/images/nova.png`,
          cid: `nova.png`,
        },
      ],
    });
    res.status(200).send({ resp });
  } catch (error) {
    console.log(`error`, error);
    res.status(500).send({ error });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
