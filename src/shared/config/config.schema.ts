import Joi from 'joi';
import { NodeEnvironment } from '@shared/enums/node-env.enum';

export const configValidationSchema = Joi.object({
  // API
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().valid(...Object.values(NodeEnvironment)),

  // POSTGRES
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_SSL_ENABLED: Joi.boolean().default(false),
});
