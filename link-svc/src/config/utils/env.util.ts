type BaseType = boolean | number | string | undefined | null;
interface IEnvOptions<T> {
    key: string;
    defaultValue?: T;
    required?: boolean;
    callback?: (value: string) => T;
}

const getEnvValue = <T extends BaseType = string>(options: IEnvOptions<T>): T => {
    const { key, defaultValue, required = false, callback } = options;
    const value: string | undefined = process.env[key];

    if (value) {
        return callback ? callback(value) : (value as unknown as T);
    }

    if (defaultValue !== undefined) {
        return defaultValue;
    }

    if (required) {
        throw new Error(`Environment variable "${key}" is required but not set`);
    }

    return undefined as T;
};

export const getEnv = (key: string, defaultValue?: any): string => {
    return getEnvValue({ key, defaultValue });
};

export const getEnvString = (key: string, defaultValue?: string): string => {
    const callback = (value: string) => {
        try {
            return String(value);
        } catch {
            throw new Error(`${key} environment variable is not a string`);
        }
    };
    return getEnvValue({ key, defaultValue, callback });
};

export const getEnvNumber = (key: string, defaultValue?: number): number => {
    const callback = (value: string) => {
        try {
            return Number(value);
        } catch {
            throw new Error(`${key} environment variable is not a number`);
        }
    };
    return getEnvValue({ key, defaultValue, callback });
};

export const getEnvBoolean = (key: string, defaultValue?: boolean): boolean => {
    const callback = (value: string) => {
        try {
            const normalized = value.toLowerCase().trim();
            if (['true', '1', 'yes', 'on'].includes(normalized)) {
                return true;
            }

            if (['false', '0', 'no', 'off'].includes(normalized)) {
                return false;
            }

            throw new Error(
                `Environment variable "${key}" must be a boolean value. ` +
                    `Accepted values: true, false, 1, 0, yes, no, on, off. Got "${value}"`,
            );
        } catch {
            throw new Error(`${key} environment variable is not a boolean`);
        }
    };

    return getEnvValue({ key, defaultValue, callback });
};
