import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface BizmButton {
  name: string;
  type: string;
  url_mobile: string;
  url_pc: string;
}

@Injectable()
export class BizmService {
  sendMessage(
    phoneNumber: string,
    templateId: string,
    message: string,
    buttons?: BizmButton[],
  ) {
    return axios.post(
      'https://alimtalk-api.bizmsg.kr/v2/sender/send',
      [
        {
          message_type: 'at',
          phn: '82' + Number(phoneNumber),
          profile: process.env.BIZM_PROFILE,
          tmplId: templateId,
          msg: message,
          reserveDt: '00000000000000',
          ...(buttons?.reduce(
            (acc, cur, i) => ({
              ...acc,
              [`button${i + 1}`]: cur,
            }),
            {},
          ) ?? {}),
        },
      ],
      {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          userid: process.env.BIZM_USER_ID,
          Accept: 'application/json',
        },
      },
    );
  }
}
