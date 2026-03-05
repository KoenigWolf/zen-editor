/**
 * 環境変数バリデーション
 * ビルド時・起動時に環境変数を検証
 */

type EnvConfig = {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_GA_ID?: string;
};

const getEnvVar = (key: string, required = false): string | undefined => {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const validateNodeEnv = (value: string | undefined): EnvConfig['NODE_ENV'] => {
  const validEnvs = ['development', 'production', 'test'] as const;
  if (!value || !validEnvs.includes(value as EnvConfig['NODE_ENV'])) {
    return 'development';
  }
  return value as EnvConfig['NODE_ENV'];
};

const validateUrl = (value: string | undefined, envName?: string): string | undefined => {
  if (!value) return undefined;
  try {
    new URL(value);
    return value;
  } catch {
    console.warn(`Invalid URL format for environment variable: ${envName ?? 'unknown'}`);
    return undefined;
  }
};

export const env: EnvConfig = {
  NODE_ENV: validateNodeEnv(process.env.NODE_ENV),
  NEXT_PUBLIC_SITE_URL: validateUrl(getEnvVar('NEXT_PUBLIC_SITE_URL'), 'NEXT_PUBLIC_SITE_URL'),
  NEXT_PUBLIC_GA_ID: getEnvVar('NEXT_PUBLIC_GA_ID'),
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
