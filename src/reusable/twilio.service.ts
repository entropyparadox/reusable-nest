import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Field, ObjectType } from '@nestjs/graphql';
import AccessToken, { VideoGrant } from 'twilio/lib/jwt/AccessToken';

@ObjectType()
export class TwilioResponse {
  @Field(() => String)
  accessToken!: string;
}

@Injectable()
export class TwilioService {
  private readonly clientId: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get('VIMEO_CLIENT_ID')!;
    this.apiKey = this.configService.get('VIMEO_CLIENT_ID')!;
    this.apiSecret = this.configService.get('VIMEO_CLIENT_ID')!;
  }

  generateAccessToken(identity: string, room: string): TwilioResponse {
    const token = new AccessToken(this.clientId, this.apiKey, this.apiSecret, {
      identity,
    });
    const videoGrant = new VideoGrant({ room });
    token.addGrant(videoGrant);
    return { accessToken: token.toJwt() };
  }
}
