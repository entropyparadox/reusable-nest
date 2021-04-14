import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { FileUpload } from 'graphql-upload';

export class File {
  body: Buffer;
  name: string;
  type: string;
  encoding: string;

  constructor(body: Buffer, name: string, type: string, encoding: string) {
    this.body = body;
    this.name = name;
    this.type = type;
    this.encoding = encoding;
  }
}

@Injectable()
export class StorageService {
  private readonly bucketName: string;
  private readonly s3: S3;
  private readonly resize_width: Number;
  private readonly resize_quality: Number;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_BUCKET')!;
    this.s3 = new S3({
      region: this.configService.get('AWS_REGION'),
      accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
    });
    this.resize_width = Number(
      this.configService.get('RESIZE_IMAGE_WIDTH', '768'),
    );
    this.resize_quality = Number(
      this.configService.get('RESIZE_IMAGE_QUALITY', '80'),
    );
  }

  private async upload(key: string, file: File | FileUpload) {
    const fileType = file instanceof File ? file.type : file.mimetype;
    let fileBuffer = file instanceof File ? file.body : file.createReadStream();
    if (fileType.includes('image')) {
      const sharp = require('sharp');
      const resizer = sharp()
        .resize({ width: this.resize_width })
        .jpeg({ quality: this.resize_quality })
        .withMetadata();
      fileBuffer =
        file instanceof File
          ? await sharp(fileBuffer)
              .resize({ width: this.resize_width })
              .jpeg({ quality: this.resize_quality })
              .withMetadata()
              .toBuffer()
          : file.createReadStream().pipe(resizer);
    }
    // TODO :: 파일포멧은 jpg로 통일되지만, 파일 확장자는 원본파일을 따라가고 있음. .jpg를 추가해줄 필요 있음.
    return this.s3
      .upload({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: fileType,
        ContentEncoding: file instanceof File ? file.encoding : undefined,
      })
      .promise();
  }

  generateKey(path: string, filename: string) {
    return `${path}/${Date.now()}_${filename}`;
  }

  add(path: string, file: File | FileUpload) {
    let filename = file instanceof File ? file.name : file.filename;
    // filename = filename.replace(/[^0-9a-zA-Z.]/g, '_');
    const key = this.generateKey(path, filename);
    return this.upload(key, file);
  }

  replace(key: string, file: File | FileUpload) {
    return this.upload(key, file);
  }

  getPreSignedUrl(key: string) {
    return this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucketName,
      Key: key,
    });
  }

  getUploadUrl(key: string) {
    return this.s3.getSignedUrlPromise('putObject', {
      Bucket: this.bucketName,
      Key: key,
    });
  }
}
