import {ExecutionContext, Injectable} from "@nestjs/common";
import { JwtAuthGuard } from './jwt-auth.guard';


@Injectable()
export class RestJwtAuthGuard extends JwtAuthGuard {
    getRequest(context: ExecutionContext) {
        return context.switchToHttp().getRequest();
    }
}