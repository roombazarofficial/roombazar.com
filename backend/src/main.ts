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

  app.use(cookieParser());

  app.getHttpAdapter().getInstance().disable("x-powered-by");

  app.enableCors({
    origin: config.getOrThrow<string[]>("CORS_ORIGINS"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86_400,
  });

  app.enableShutdownHooks();

  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  const port = config.getOrThrow<number>("PORT");
  // Render routes traffic to the port it provides and requires the process to
  // accept connections outside the container's loopback interface.
  await app.listen(port, "0.0.0.0");

  new Logger("Bootstrap").log(`API listening on http://localhost:${port}/api`);
}

void bootstrap();
