import * as redis from 'redis';

type SetOptions = {
    ttl?: number;
};

export type ClientType = {
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

    function set(key: string, payload: string, options?: SetOptions) {
        return new Promise<Boolean>((resolve, reject) => {
            if (!client) reject(new Error('client undefined'));

            client.set(key, payload, (err) => {
                if (err) reject(err);
                if (options && options.ttl) {
                    client.expire(key, options.ttl, reject);
                }
                resolve(true);
            });
        });
    }

    function update(key: string, payload: string) {
        return new Promise<Boolean>((resolve, reject) => {
            if (!client) reject(new Error('client undefined'));

            client.set(key, payload, 'KEEPTTL', (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    function setObject<T = any>(key: string, payload: T, options?: SetOptions) {
        return new Promise<Boolean>((resolve, reject) => {
            if (!client) reject(new Error('client undefined'));

            const serializedJson = JSON.stringify(payload);

            client.set(key, serializedJson, (err) => {
                if (err) reject(err);
                if (options && options.ttl) {
                    client.expire(key, options.ttl, reject);
                }
                resolve(true);
            });
        });
    }

    function updateObject<T = any>(key: string, payload: T) {
        return new Promise<Boolean>(async (resolve, reject) => {
            if (!client) reject(new Error('client undefined'));

            const serializedJson = JSON.stringify(payload);

            client.set(key, serializedJson, 'KEEPTTL', (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    function get(key: string) {
        return new Promise<string | null>((resolve, reject) => {
            if (!client) reject(new Error('client undefined'));

            client.get(key, (err, reply) => {
                if (err) reject(err);

                resolve(reply);
            });
        });
    }

    function getObject<T = any>(key: string): Promise<T | null> {
        return new Promise<T | null>((resolve, reject) => {
            if (!client) reject(new Error('client undefined'));

            client.get(key, (err, reply) => {
                if (err) reject(err);
                if (!reply) reject(new Error('no data'));

                const obj = JSON.parse(reply!) as T;
                resolve(obj);
            });
        });
    }

    function del(key: string) {
        return new Promise<Boolean>((resolve, reject) => {
            if (!client) reject(new Error('client undefined'));

            client.del(key, (err) => {
                if (err) reject(err);
                resolve(true);
            });
        });
    }

    return {
        close,
        clear,
        set,
        setObject,
        update,
        updateObject,
        get,
        getObject,
        del,
        client,
    };
}

export default Client;
