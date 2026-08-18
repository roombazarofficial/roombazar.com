import { Module } from "@nestjs/common";
import { SavedController } from "./saved.controller";

@Module({ controllers: [SavedController] })
export class SavedModule {}
