import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configServices: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
          (request: Request) => {
            console.log(request.cookies.Authentication)
            return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: configServices.getOrThrow('JWT_SECRET'),
    });
  }
   async validate(payload: any) {
    return payload;
   }
}