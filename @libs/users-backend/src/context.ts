import type { EntityManager } from "@mikro-orm/core";

export interface UserLibraryContext {
  em: EntityManager;
  configuration: {
    jwtSecret: string;
  };
}

export interface AuthLibraryContext {
  em: EntityManager;
  configuration: {
    jwtRefreshSecret: string;
    jwtSecret: string;
  };
}

export interface CurriculumLibraryContext {
  em: EntityManager;
  configuration: {
    jwtSecret: string;
  };
}

export interface SectionTemplatesLibraryContext {
  em: EntityManager;
  configuration: {
    jwtSecret: string;
  };
}

export interface SectionsLibraryContext {
  em: EntityManager;
  configuration: {
    jwtSecret: string;
  };
}

export interface SectionItemsLibraryContext {
  em: EntityManager;
  configuration: {
    jwtSecret: string;
  };
}
