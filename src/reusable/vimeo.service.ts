import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Field, ObjectType } from '@nestjs/graphql';
import { Vimeo } from 'vimeo';

@ObjectType()
export class VimeoResponse {
  @Field(() => String)
  videoId!: string;

  @Field(() => String)
  uploadLink!: string;
}

@Injectable()
export class VimeoService {
  readonly client: Vimeo;

  constructor(private configService: ConfigService) {
    this.client = new Vimeo(
      this.configService.get<string>('VIMEO_CLIENT_ID') as string,
      this.configService.get<string>('VIMEO_CLIENT_SECRET') as string,
      this.configService.get<string>('VIMEO_ACCESS_TOKEN'),
    );
  }

  private getVideoId(uri: string) {
    const index = uri.lastIndexOf('/');
    return uri.substr(index + 1);
  }

  async createVideo(size: number): Promise<VimeoResponse> {
    const result = await new Promise<any>((resolve, reject) => {
      this.client.request(
        {
          method: 'POST',
          path: '/me/videos',
          query: {
            upload: {
              approach: 'tus',
              size,
            },
            name: `${Date.now()}`,
          },
        },
        (err, result, statusCode, headers) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        },
      );
    });

    return {
      videoId: this.getVideoId(result.uri),
      uploadLink: result.upload.upload_link,
    };
  }

  async replaceVideo(videoId: string, size: number): Promise<VimeoResponse> {
    const result = await new Promise<any>((resolve, reject) => {
      this.client.request(
        {
          method: 'POST',
          path: `/videos/${videoId}/versions`,
          query: {
            file_name: `${Date.now()}`,
            upload: {
              approach: 'tus',
              size,
              status: 'in_progress',
            },
          },
        },
        (err, result, statusCode, headers) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        },
      );
    });

    return {
      videoId: this.getVideoId(result.uri),
      uploadLink: result.upload.upload_link,
    };
  }

  async deleteVideo(videoId: string) {
    const result = await new Promise<any>((resolve, reject) => {
      this.client.request(
        {
          method: 'DELETE',
          path: `/videos/${videoId}`,
          query: {
            video_id: videoId,
          },
        },
        (err, result, statusCode, headers) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        },
      );
    });
    return result;
  }
}
