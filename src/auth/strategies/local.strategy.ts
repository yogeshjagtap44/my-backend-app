import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
 import { Strategy } from "passport-local";
import { UsersService } from "src/users/users.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
        usernameField: 'email',
        passwordField: 'password'
    });
  }

  async validate(username: string, password: string) {
    try {
        
        return await this.usersService.verifyUser(username, password);
    } catch (error) {
        throw new UnauthorizedException('Invalid credentials');
    }
  }
}