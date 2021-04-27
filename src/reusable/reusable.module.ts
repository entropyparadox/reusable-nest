import { Module } from '@nestjs/common';
import { AgoraService } from './agora.service';
import { BizmService } from './bizm.service';
import { StorageService } from './storage.service';
import { TwilioService } from './twilio.service';
import { VimeoService } from './vimeo.service';

@Module({
  providers: [
    AgoraService,
    BizmService,
    StorageService,
    TwilioService,
    VimeoService,
  ],
  exports: [
    AgoraService,
    BizmService,
    StorageService,
    TwilioService,
    VimeoService,
  ],
})
export class ReusableModule {}
