import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { TokenPayload } from './token-payload.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    async login(user: User, response: Response) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 1);
        const tokenPayload: TokenPayload = {
            id: user.id,
            email: user.email,
        };

        const token = this.jwtService.sign(tokenPayload);
        response.cookie('Authentication', token, {
            expires,
            httpOnly: true,
        });
        
    }
}
