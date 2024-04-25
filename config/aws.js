import AWS from "aws-sdk"
import "dotenv/config"
const credentials = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_IAM_USER_NAME,
  secretAccessKey: process.env.AWS_IAM_PASSWORD,
}
function configAWS() {
  AWS.config.update(credentials)
}
export default configAWS
