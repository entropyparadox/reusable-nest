import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { TwilioService } from './twilio.service';
import { VimeoService } from './vimeo.service';

@Module({
  providers: [StorageService, TwilioService, VimeoService],
  exports: [StorageService, TwilioService, VimeoService],
})
export class ReusableModule {}
