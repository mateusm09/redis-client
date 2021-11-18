import * as redis from 'redis';

type SetOptions = {
    ttl: number;
};

export type ClientType = {
    close: () => void;
    clear: () => void;
    set: (key: string, payload: string, options?: SetOptions) => Promise<Boolean>;
    get: (key: string) => Promise<String | null>;
    setObject: <T = any>(key: string, payload: T, options?: SetOptions) => Promise<Boolean>;
    getObject: <T = any>(key: string) => Promise<T | null>;
    del: (key: string) => Promise<Boolean>;
    client: redis.RedisClient;
};

export function init(_opts?: redis.ClientOpts) {
    return new Promise<redis.RedisClient>((resolve, reject) => {
        const _client = redis.createClient(_opts);

        _client.on('ready', () => {
            resolve(_client);
        });

        _client.on('error', (err) => {
            reject(err);
        });
    });
}

async function Client(opts?: redis.ClientOpts): Promise<ClientType> {
    const client = await init(opts).catch((err) => {
        throw err;
    });

    function close() {
        return client.quit();
    }

    function clear() {
        return client.flushall();
    }

    function set(key: string, payload: string, options?: { ttl: number }) {
        return new Promise<Boolean>((resolve, reject) => {
            if (client) {
                client.set(key, payload, (err, res) => {
                    if (err) reject(err);
                    else if (options) {
                        if (options.ttl) {
                            client.expire(key, options.ttl, (err, res) => {
                                if (err) reject(err);
                                else resolve(true);
                            });
                        } else resolve(true);
                    } else resolve(true);
                });
            } else {
                reject(new Error('client undefined'));
            }
        });
    }

    function setObject<T = any>(key: string, payload: T, options?: { ttl: number }) {
        return new Promise<Boolean>((resolve, reject) => {
            if (client) {
                const serializedJson = JSON.stringify(payload);

                client.set(key, serializedJson, (err) => {
                    if (err) reject(err);
                    else if (options) {
                        if (options.ttl) {
                            client.expire(key, options.ttl, (redisErr) => {
                                if (redisErr) reject(redisErr);
                                else resolve(true);
                            });
                        } else resolve(true);
                    } else resolve(true);
                });
            } else {
                reject(new Error('client undefined'));
            }
        });
    }

    function get(key: string) {
        return new Promise<String | null>((resolve, reject) => {
            if (client) {
                client.get(key, (err, reply) => {
                    if (err) reject(err);
                    else resolve(reply);
                });
            } else {
                reject(new Error('client undefined'));
            }
        });
    }

    function getObject<T = any>(key: string): Promise<T | null> {
        return new Promise<T | null>((resolve, reject) => {
            if (client) {
                client.get(key, (err, reply) => {
                    if (err) reject(err);
                    else {
                        const obj = JSON.parse(reply!) as T;
                        resolve(obj);
                    }
                });
            } else {
                reject(new Error('client undefined'));
            }
        });
    }

    function del(key: string) {
        return new Promise<Boolean>((resolve, reject) => {
            if (client) {
                client.del(key, (err, reply) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            } else {
                reject(new Error('client undefined'));
            }
        });
    }

    return {
        close,
        clear,
        set,
        setObject,
        get,
        getObject,
        del,
        client,
    };
}

export default Client;
