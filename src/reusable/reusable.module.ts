import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { VimeoService } from './vimeo.service';

@Module({
  providers: [StorageService, VimeoService],
  exports: [StorageService, VimeoService],
})
export class ReusableModule {}
