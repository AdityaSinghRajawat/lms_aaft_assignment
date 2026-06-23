import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

/**
 * Strongly-typed, validated application environment.
 * Fails fast at boot if a required variable is missing or malformed.
 */
export interface AppEnv {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  apiPrefix: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptSaltRounds: number;
}

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('/api'),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(4).max(15).default(10),
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
