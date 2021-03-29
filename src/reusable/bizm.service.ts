import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BizmService {
  sendMessage(templateId: string, message: string, phoneNumber: string) {
    axios
      .post(
        'https://alimtalk-api.bizmsg.kr/v2/sender/send',
        [
          {
            message_type: 'at',
            phn: '82' + Number(phoneNumber),
            profile: process.env.BIZM_PROFILE,
            tmplId: templateId,
            msg: message,
            reserveDt: '00000000000000',
          },
        ],
        {
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            userid: process.env.BIZM_USER_ID,
            Accept: 'application/json',
          },
        },
      )
      .catch(function (err: any) {
        console.log(err);
      });
  }
}
