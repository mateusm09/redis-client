import * as redis from 'redis';
declare type SetOptions = {
    ttl: number;
};
export declare type ClientType = {
    close: () => void;
    clear: () => void;
    set: (key: string, payload: string, options?: SetOptions) => Promise<Boolean | redis.RedisError>;
    get: (key: string) => Promise<String | null | redis.RedisError>;
    setObject: <T = any>(key: string, payload: T, options?: SetOptions) => Promise<Boolean | redis.RedisError>;
    getObject: <T = any>(key: string) => Promise<T | null | redis.RedisError>;
    del: (key: string) => Promise<Boolean | redis.RedisError>;
};
export declare function init(_opts?: redis.ClientOpts): Promise<redis.RedisClient>;
declare function Client(opts?: redis.ClientOpts): Promise<ClientType>;
export default Client;
