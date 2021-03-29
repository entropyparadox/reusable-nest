import { Module } from '@nestjs/common';
import { BizmService } from './bizm.service';
import { StorageService } from './storage.service';
import { TwilioService } from './twilio.service';
import { VimeoService } from './vimeo.service';

@Module({
  providers: [BizmService, StorageService, TwilioService, VimeoService],
  exports: [BizmService, StorageService, TwilioService, VimeoService],
})
export class ReusableModule {}
