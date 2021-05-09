import {ExecutionContext, Injectable} from "@nestjs/common";
import { LocalAuthGuard } from './local-auth.guard';


@Injectable()
export class RestLocalAuthGuard extends LocalAuthGuard {
    getRequest(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();
        req.body = context.getArgs();
        return req;
    }
}