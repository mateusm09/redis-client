import * as redis from 'redis';
import Client, { init } from './RedisClient';

export type TimeoutType = {
    /**
     * Sets the callback that's called when a key expires.
     * Needs a single callback because redis cannot listen to a single key event
     * @param cb callback thats called when a key is expired
     */
    setCallback: (cb: Function) => void;

    /**
     * Uses redis key events to create a Timeout function
     * @param key redis key which will be used to store the timeout
     * @param data data that's passed to callback as argument
     * @param timeout expiration time in seconds
     */
    setTimeout: <T>(key: string, data: T, timeout: number) => void;

    /**
     * Clears the timeout
     * @param key Key for the timeout and its data
     */
    clearTimeout: (key: string) => void;
};

async function Timeout(opts: redis.ClientOpts): Promise<TimeoutType> {
    const subClient = await init(opts).catch((err) => {
        throw err;
    });
    subClient.config('SET', 'notify-keyspace-events', 'KEA', (err) => {
        if (err) throw new Error('Unable to set configuration for key events');
        else subClient.subscribe('__keyevent@0__:expired');
    });
    const dataClient = await Client(opts);

    function setCallback(cb: Function) {
        subClient.on('message', async (channel, timeoutKey) => {
            const [id, key] = timeoutKey.split(':');
            const data = await dataClient.getObject(key);
            cb(data);
            dataClient.del(key);
        });
    }

    /**
     * Uses redis key events to create a Timeout function
     * @param key redis key which will be used to store the timeout
     * @param data data that's passed to callback as argument
     * @param timeout expiration time in seconds
     */
    function setTimeout<T>(key: string, data: T, timeout = 1) {
        dataClient.set(`timeout:${key}`, '', { ttl: timeout }).then((res) => {
            if (res) {
                dataClient.setObject<T>(key, data);
            }
        });
    }

    /**
     * Clears the timeout
     * @param key Key for the timeout and its data
     */
    async function clearTimeout(key: string) {
        await dataClient.del(`timeout:${key}`);
        await dataClient.del(key);
    }

    return {
        setCallback,
        setTimeout,
        clearTimeout,
    };
}

export default Timeout;
