import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionCode } from './exception-code.enum';

export interface ReusableExceptionMessage {
  en?: string;
  ko?: string;
}

export interface ReusableExceptionOptions {
  language?: 'en' | 'ko';
}

export class ReusableException extends HttpException {
  constructor(
    code: ExceptionCode | string,
    message?: ReusableExceptionMessage,
    options?: ReusableExceptionOptions,
  ) {
    const msg = {
      ...ReusableException.defaultMessage,
      ...(ReusableException.messages[code] ?? {}),
      ...message,
    };

    super(
      {
        code,
        msg,
        message: msg[options?.language ?? 'ko'],
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static defaultMessage = {
    en: 'Something went wrong',
    ko: '에러가 발생했습니다',
  };

  static messages: { [key: string]: ReusableExceptionMessage } = {
    [ExceptionCode.SIGNUP_FAILED]: {
      en: 'Sign up failed',
      ko: '회원가입에 실패했습니다',
    },
    [ExceptionCode.INVALID_EMAIL]: {
      en: 'Invalid email address',
      ko: '이메일 주소 형식이 잘못되었습니다',
    },
    [ExceptionCode.DUPLICATE_EMAIL]: {
      en: 'Email has already been taken',
      ko: '이미 등록된 이메일 주소입니다',
    },
    [ExceptionCode.LOGIN_FAILED]: {
      en: 'Login failed',
      ko: '로그인에 실패했습니다',
    },
  };
}
