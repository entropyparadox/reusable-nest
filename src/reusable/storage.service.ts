import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { FileUpload } from 'graphql-upload';

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {}

  private get s3() {
    return new S3({
      region: this.configService.get<string>('REGION'),
      accessKeyId: this.configService.get<string>('ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('SECRET_KEY'),
    });
  }

  private get bucketName() {
    return this.configService.get<string>('BUCKET_NAME')!;
  }

  private async upload(key: string, file: FileUpload) {
    return this.s3
      .upload({
        Bucket: this.bucketName,
        Key: key,
        Body: file.createReadStream(),
        ContentType: file.mimetype,
      })
      .promise();
  }

  async add(path: string, file: FileUpload) {
    const filename = file.filename.replace(/[^0-9a-zA-Z.]/g, '_');
    const key = `${path}/${Date.now()}_${filename}`;
    return this.upload(key, file);
  }

  async replace(key: string, file: FileUpload) {
    return this.upload(key, file);
  }

  getPreSignedUrl(key: string) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: 60 * 60, // 1 hour
    };
    return this.s3.getSignedUrlPromise('getObject', params);
  }
}
