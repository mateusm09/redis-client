import * as redis from 'redis';
export declare type TimeoutType = {
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
declare function Timeout(opts: redis.ClientOpts): Promise<TimeoutType>;
export default Timeout;
