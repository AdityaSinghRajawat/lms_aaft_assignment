import dotenv from 'dotenv';
import Joi from 'joi';
import { APP, NODE_ENVS, NodeEnv } from '../constants/app.constants';
import { JWT } from '../constants/jwt.constants';
import { BCRYPT } from '../constants/security.constants';

dotenv.config();

export interface AppEnv {
  nodeEnv: NodeEnv;
  port: number;
  apiPrefix: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
}

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid(...NODE_ENVS).default('development'),
  PORT: Joi.number().port().default(APP.DEFAULT_PORT),
  API_PREFIX: Joi.string().default(APP.DEFAULT_API_PREFIX),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.string().default(JWT.DEFAULT_EXPIRES_IN),
  BCRYPT_SALT_ROUNDS: Joi.number()
    .integer()
    .min(BCRYPT.MIN_SALT_ROUNDS)
    .max(BCRYPT.MAX_SALT_ROUNDS)
    .default(BCRYPT.DEFAULT_SALT_ROUNDS),
})
  .unknown(true)
  .prefs({ abortEarly: false });

const { value, error } = envSchema.validate(process.env);

if (error) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  error.details.forEach((d) => console.error(`   - ${d.message}`));
  process.exit(1);
}

export const env: AppEnv = {
  nodeEnv: value.NODE_ENV,
  port: value.PORT,
  apiPrefix: value.API_PREFIX,
  databaseUrl: value.DATABASE_URL,
  jwtSecret: value.JWT_SECRET,
  jwtExpiresIn: value.JWT_EXPIRES_IN,
  bcryptSaltRounds: value.BCRYPT_SALT_ROUNDS,
};

export const isProduction = env.nodeEnv === 'production';
export const isTest = env.nodeEnv === 'test';
