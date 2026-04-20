import { RefreshTokenEntity } from "#src/entities/refresh-token.entity.js";
import { UserEntity } from "#src/entities/user.entity.js";
import { CurriculumEntity } from "#src/entities/curriculum.entity.js";
import { SectionTemplatesEntity } from "#src/entities/section-templates.entity.js";
import { SectionsEntity } from "#src/entities/sections.entity.js";
import { SectionItemsEntity } from "#src/entities/section-items.entity.js";

export * from "#src/entities/user.entity.js";
export * from "#src/entities/refresh-token.entity.js";
export * from "#src/entities/curriculum.entity.js";
export * from "#src/entities/section-templates.entity.js";
export * from "#src/entities/sections.entity.js";
export * from "#src/entities/section-items.entity.js";

export * from "#src/serializers/user.serializer.js";
export * from "#src/serializers/curriculum.serializer.js";
export * from "#src/serializers/section-templates.serializer.js";
export * from "#src/serializers/sections.serializer.js";
export * from "#src/serializers/section-items.serializer.js";

export * from "#src/routes/create.route.js";
export * from "#src/routes/delete.route.js";
export * from "#src/routes/get.route.js";
export * from "#src/routes/list.route.js";
export * from "#src/routes/login.route.js";
export * from "#src/routes/logout.route.js";
export * from "#src/routes/profile.route.js";
export * from "#src/routes/refresh.route.js";
export * from "#src/routes/update.route.js";

export * from "#src/utils/token.utils.js";
export * from "#src/utils/token-cleanup.utils.js";
export * from "#src/init.js";
export * from "#src/utils/jwt.utils.js";
export * from "#src/utils/auth.utils.js";
export * from "#src/middlewares/jwt-auth.middleware.js";

export * from "#src/routes/curriculums/get.route.js";
export * from "#src/routes/curriculums/list.route.js";
export * from "#src/routes/curriculums/create.route.js";
export * from "#src/routes/curriculums/update.route.js";
export * from "#src/routes/curriculums/delete.route.js";
export * from "#src/routes/curriculums/duplicate.route.js";
export * from "#src/routes/curriculums/export.route.js";

export * from "#src/routes/section-templates/list.route.js";

export * from "#src/routes/sections/create.route.js";
export * from "#src/routes/sections/update.route.js";
export * from "#src/routes/sections/delete.route.js";
export * from "#src/routes/sections/update.reorder.route.js";
export * from "#src/routes/sections/get.route.js";

export * from "#src/routes/section-items/create.route.js";
export * from "#src/routes/section-items/update.route.js";
export * from "#src/routes/section-items/delete.route.js";
export * from "#src/routes/section-items/update.reorder.route.js";
export * from "#src/routes/section-items/upload.pdp.route.js";
export * from "#src/routes/section-items/get.pdp.route.js";

export const entities = [
  UserEntity,
  RefreshTokenEntity,
  CurriculumEntity,
  SectionTemplatesEntity,
  SectionsEntity,
  SectionItemsEntity,
];
