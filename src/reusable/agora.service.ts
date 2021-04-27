import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Field, ObjectType } from '@nestjs/graphql';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';

@ObjectType()
export class AgoraResponse {
  @Field(() => String)
  token!: string;
}

@Injectable()
export class AgoraService {
  private readonly appId: string;
  private readonly appCertificate: string;

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get('AGORA_APP_ID')!;
    this.appCertificate = this.configService.get('AGORA_APP_CERTIFICATE')!;
  }

  generateToken(channelName: string, uid: number): AgoraResponse {
    const token = RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      0,
    );
    return { token };
  }
}
