import * as redis from 'redis';
declare type SetOptions = {
    ttl?: number;
};
export declare type ClientType = {
    close: () => void;
    clear: () => void;
    set: (key: string, payload: string, options?: SetOptions) => Promise<Boolean>;
    get: (key: string) => Promise<string | null>;
    setObject: <T = any>(key: string, payload: T, options?: SetOptions) => Promise<Boolean>;
    getObject: <T = any>(key: string) => Promise<T | null>;
    update: (key: string, payload: string) => Promise<Boolean>;
    updateObject: <T = any>(key: string, payload: T) => Promise<Boolean>;
    del: (key: string) => Promise<Boolean>;
    client: redis.RedisClient;
};
export declare function init(_opts?: redis.ClientOpts): Promise<redis.RedisClient>;
declare function Client(opts?: redis.ClientOpts): Promise<ClientType>;
export default Client;
