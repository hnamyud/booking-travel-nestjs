import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import { JwtAuthGuard } from './auth/jw-auth.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { helmetConfig } from './config/helmet.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Apply helmet middleware with custom config
  app.use(helmet(helmetConfig));

  // Config CORS
  app.enableCors({
    origin: 'http://localhost:5173', // FE domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // Use JWT global
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalPipes(new ValidationPipe());
  // Transform response from controller
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  //Config versoning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  // Config cookie (Http-only, Secure)
  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booking Travel API')
    .setDescription('API docs for booking system')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header'
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.get('PORT'));
}
bootstrap();
