import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

@Injectable()
export class UploadService {
  private s3;

  constructor(
    @Inject(forwardRef(() => LoggerService))
    private loggerService: LoggerService,
  ) {
    try {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_REGION,
      });
    } catch (error) {
      this.loggerService.error('S3InitError', error);
    }
  }

  // save file on aws s3 bucket. path is subdirectory name and name is file name to be saved
  async saveFileOnS3(file: Express.Multer.File, path: string, name: string) {
    try {
      const fileBuffer = file.buffer;
      const base64 = fileBuffer.toString('base64');
      const base64Data: Buffer = Buffer.from(
        base64.replace(/^data:image\/\w+;base64,/, ''),
        'base64',
      );
      const new_name =
        path + '/' + name + '.' + file.originalname.split('.')[1];
      const params = {
        Bucket: 'debook-user-data',
        Key: new_name,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/${file.originalname.split('.')[1]}`,
      };
      const res = await this.s3.upload(params).promise();
      const file_url = res.Location;
      return {
        status: true,
        file_url,
      };
    } catch (error) {
      this.loggerService.debug('SaveFileOnS3', error);
      return {
        status: false,
        file_url: '',
      };
    }
  }

  async deleteFileOnS3(fileUrl: string) {
    const { bucketName, key } = this.getBucketAndKeyFromUrl(fileUrl);
    try {
      await this.s3
        .deleteObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
    } catch (error) {
      this.loggerService.debug('DeleteFileOnS3', error);
      throw error;
    }
  }

  getBucketAndKeyFromUrl(url: string) {
    const urlObj = new URL(url);
    const bucketName = urlObj.host.split('.')[0];
    const key = decodeURIComponent(urlObj.pathname.substring(1));
    return { bucketName, key };
  }
}
