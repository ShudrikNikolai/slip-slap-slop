import { ConfigService } from '@/config';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis;
    private subscriber: Redis;
    private publisher: Redis;

    constructor(private configService: ConfigService) {}

    async onModuleInit(): Promise<void> {
        await this.connect();
        this.logger.log('Redis service initialized');
    }

    async onModuleDestroy(): Promise<void> {
        await this.disconnect();
        this.logger.log('Redis service destroyed');
    }

    private async connect(): Promise<void> {
        try {
            const config = this.configService.redis;

            const options: RedisOptions = {
                host: config.host,
                port: config.port,
                password: config.password,
                db: config.db,
                keyPrefix: config.keyPrefix,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
            };

            this.client = new Redis(options);

            // Для pub/sub
            this.subscriber = new Redis(options);
            this.publisher = new Redis(options);

            // Обработчики событий
            this.setupEventHandlers();

            this.logger.log(`Connected to Redis at ${config.host}:${config.port}`);
        } catch (error) {
            this.logger.error('Failed to connect to Redis', error.stack);
            throw error;
        }
    }

    private setupEventHandlers(): void {
        this.client.on('error', (error) => {
            this.logger.error('Redis client error', error.message);
        });

        this.client.on('connect', () => {
            this.logger.debug('Redis client connected');
        });

        this.client.on('ready', () => {
            this.logger.debug('Redis client ready');
        });

        this.client.on('reconnecting', () => {
            this.logger.warn('Redis client reconnecting');
        });
    }

    private async disconnect(): Promise<void> {
        try {
            await Promise.all([this.client?.quit(), this.subscriber?.quit(), this.publisher?.quit()]);
            this.logger.log('Disconnected from Redis');
        } catch (error) {
            this.logger.error('Error disconnecting from Redis', error.message);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            this.logger.error(`Failed to get key: ${key}`, error.message);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        try {
            const stringValue = JSON.stringify(value);
            if (ttl) {
                await this.client.setex(key, ttl, stringValue);
            } else {
                await this.client.set(key, stringValue);
            }
        } catch (error) {
            this.logger.error(`Failed to set key: ${key}`, error.message);
            throw error;
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            this.logger.error(`Failed to delete key: ${key}`, error.message);
            throw error;
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            this.logger.error(`Failed to check key: ${key}`, error.message);
            return false;
        }
    }

    async expire(key: string, ttl: number): Promise<boolean> {
        try {
            const result = await this.client.expire(key, ttl);
            return result === 1;
        } catch (error) {
            this.logger.error(`Failed to expire key: ${key}`, error.message);
            return false;
        }
    }

    async publish(channel: string, message: any): Promise<number> {
        try {
            const stringMessage = JSON.stringify(message);
            return await this.publisher.publish(channel, stringMessage);
        } catch (error) {
            this.logger.error(`Failed to publish to channel: ${channel}`, error.message);
            throw error;
        }
    }

    async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
        try {
            await this.subscriber.subscribe(channel);

            this.subscriber.on('message', (ch, message) => {
                if (ch === channel) {
                    try {
                        const parsedMessage = JSON.parse(message);
                        callback(parsedMessage);
                    } catch (error) {
                        this.logger.error('Failed to parse message', error.message);
                    }
                }
            });
        } catch (error) {
            this.logger.error(`Failed to subscribe to channel: ${channel}`, error.message);
            throw error;
        }
    }

    getClient(): Redis {
        return this.client;
    }
}
