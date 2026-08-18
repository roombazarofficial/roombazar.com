import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const config = app.get(ConfigService);

  app.setGlobalPrefix("api");

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );

  app.use(compression());

  // The session token arrives as an httpOnly cookie, so it has to be parsed
  // before any guard can read it.
  app.use(cookieParser());

  app.getHttpAdapter().getInstance().disable("x-powered-by");

  app.enableCors({
    origin: config.getOrThrow<string[]>("CORS_ORIGINS"),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86_400,
  });

  app.enableShutdownHooks();

  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  const port = config.getOrThrow<number>("PORT");
  await app.listen(port);

  new Logger("Bootstrap").log(`API listening on http://localhost:${port}/api`);
}

void bootstrap();
