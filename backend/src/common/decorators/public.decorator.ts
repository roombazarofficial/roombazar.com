import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC = "ispublic";

export const Public = () => SetMetadata(IS_PUBLIC, true);
