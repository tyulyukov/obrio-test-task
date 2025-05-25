import Joi from 'joi';
import { NodeEnvironment } from '@shared/env/node-env.enum';

export const configValidationSchema = Joi.object({
  // API
  API_PORT: Joi.number().required(),
  PROCESSOR_PORT: Joi.number().required(),
  NODE_ENV: Joi.string().valid(...Object.values(NodeEnvironment)),

  // POSTGRES
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_SSL_ENABLED: Joi.boolean().default(false),

  // REDIS
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_USER: Joi.string().allow('').optional(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_BOTTLENECK_DB: Joi.number().default(1),
  REDIS_BULLMQ_DB: Joi.number().default(2),
  REDIS_TLS_ENABLED: Joi.boolean().default(false),

  // GOOGLE DRIVE
  GOOGLE_DRIVE_CLIENT_EMAIL: Joi.string().required(),
  GOOGLE_DRIVE_PRIVATE_KEY: Joi.string().required(),
  GOOGLE_DRIVE_BOTTLENECK_MAX_CONCURRENT: Joi.number().default(5),
  GOOGLE_DRIVE_BOTTLENECK_MIN_TIME: Joi.number().default(1000),
});
