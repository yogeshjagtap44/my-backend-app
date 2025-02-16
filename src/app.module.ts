import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
 import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DB_HOST: joi.string().required(),
        DB_PORT: joi.number().required(),
        DB_USERNAME: joi.string().required(),
        DB_PASSWORD: joi.string().required(),
        DB_NAME: joi.string().required(),
      }),
    }),
    /* Graphql */
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true
    }),
    DatabaseModule,
    UsersModule,
    /* Custom Logger */
    LoggerModule.forRootAsync({
      useFactory: (confirService: ConfigService) => {
        const isProduction = confirService.get('NODE_ENV') === 'production'
        return {
          pinoHttp: {
            transport: isProduction ? undefined : {
              target: 'pino-pretty',
              options: {
                singleLine: true
              }
            },
            level: isProduction ? 'info' : 'debug'
          }
        }
      },
      inject: [ConfigService]
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
