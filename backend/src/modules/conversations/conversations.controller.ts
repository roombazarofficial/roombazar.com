import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
} from "@nestjs/common";
import { z } from "zod";
import { CurrentUser } from "src/common/decorators/currentuser.decorator";
import {
  ThrottleContact,
  ThrottleMessage,
} from "src/common/decorators/throttle.decorator";
import { ZodValidationPipe } from "src/common/pipes/zodvalidation.pipe";
import type { User } from "src/domain/user.entity";
import { ConversationsService } from "./conversations.service";

const startSchema = z.object({
  listingId: z.string().min(1),
  body: z.string().trim().min(1).max(2000),
});

const sendSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

@Controller("conversations")
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    return this.conversations.listForUser(user);
  }

  @Get(":id/messages")
  async messages(@Param("id") id: string, @CurrentUser() user: User) {
    return this.conversations.messages(id, user);
  }

  @ThrottleContact()
  @Post()
  async start(
    @Body(new ZodValidationPipe(startSchema))
    dto: z.infer<typeof startSchema>,
    @CurrentUser() user: User,
  ) {
    return this.conversations.start(dto.listingId, user, dto.body);
  }

  @ThrottleMessage()
  @Post(":id/messages")
  async send(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(sendSchema)) dto: z.infer<typeof sendSchema>,
    @CurrentUser() user: User,
  ) {
    return this.conversations.send(id, user, dto.body);
  }

  @Post(":id/reveal")
  @HttpCode(200)
  async reveal(@Param("id") id: string, @CurrentUser() user: User) {
    const conversation = await this.conversations.reveal(id, user);

    return {
      conversation,
      publicCounterpartPhone: await this.conversations.counterpartPhone(
        id,
        user,
      ),
    };
  }

  @Post(":id/read")
  @HttpCode(204)
  async markRead(@Param("id") id: string, @CurrentUser() user: User) {
    await this.conversations.markRead(id, user);
  }

  @Post(":id/block")
  @HttpCode(200)
  async block(@Param("id") id: string, @CurrentUser() user: User) {
    return this.conversations.block(id, user);
  }
}
