import { Inject, Type } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { AgoraService } from './agora.service';
import { BaseModel } from './base-model.entity';
import { BizmService } from './bizm.service';
import { IReusableService } from './reusable.service';
import { StorageService } from './storage.service';
import { TwilioService } from './twilio.service';
import { VimeoService } from './vimeo.service';

export interface IReusableResolver<Service, Entity> {
  readonly service: Service;
  readonly agoraService: AgoraService;
  readonly bizmService: BizmService;
  readonly storageService: StorageService;
  readonly twilioService: TwilioService;
  readonly vimeoService: VimeoService;
}

export function ReusableResolver<
  Service extends IReusableService<Entity>,
  Entity extends BaseModel
>(
  reusableService: Type<Service>,
  entity: Type<Entity>,
): Type<IReusableResolver<Service, Entity>> {
  @Resolver()
  class ReusableResolverHost {
    @Inject(reusableService) readonly service!: Service;
    @Inject(AgoraService) readonly agoraService!: AgoraService;
    @Inject(BizmService) readonly bizmService!: BizmService;
    @Inject(StorageService) readonly storageService!: StorageService;
    @Inject(TwilioService) readonly twilioService!: TwilioService;
    @Inject(VimeoService) readonly vimeoService!: VimeoService;
  }
  return ReusableResolverHost;
}
