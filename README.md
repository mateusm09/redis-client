# Redis Promisified Client

This module wraps the node [redis](https://www.npmjs.com/package/redis) client to provide a promise-based interface, providing the most used methods in the api (get, set).
It also a redis-based timeout API, where it uses the pubsub functionality to implement the timeout. The goal of using redis to control timeouts, it's because you can make your application stateless, and let redis manage the timeouts.

Full typescript support, with module declarations.

## Example 

### Client Usage
```ts
async function main() {

    // Iinitialize the client with the default configuration
    const client = Client();

    // Sets a string value to a key (returns true if the key is created)
    await client.set("key", "value");

    const value = await client.get("key");
    console.log("Value", value);

    // Deletes the key from the database
    await client.del("key");
}
```

### Timeout Usage
```ts
async function main() { 
    const timeout = await Timeout();

    timeout.setCallback(async (data) => {
        console.log("timedout", data);

        // Do something with the data
        // Like send a message to the user, 
        // inidicating that the timeout has expired
    });

    const user = { 
        id: 1,
        name: "John Doe"
    };

    timeout.setTimeout('req:1', user, 10);
    // After 10 seconds, the callback will be called with the user data

    if( /* ... */ ) {
        // Cancel the timeout
        timeout.clearTimeout('req:1');
    }
}
```

## Client API

### `Client(opts?: redis.ClientOpts): Promise<ClientType>`
Creates a new client with redis module client options

```ts
const client = await Client({
    host: 'localhost',
    port: 6379,
    password: 'password',
});
```

### `set(key: string, payload: string, options: { ttl: number }): Promise<Boolean>`
Sets a value to the database with the corresponding key. Returns true if the key is created.

```ts
await client.set("key", "value", { ttl: 1000 });
```

### `get(key: string): Promise<String | null>`
Gets the value from the database with the corresponding key. Returns the value in string type.

```ts
const value = await client.get("key");
```

### `del(key: string): Promise<Boolean>`
Deletes the key from the database. Returns true if the key is deleted.

```ts	
await client.del("key");
```

### `setObject<T = any>(key: string, payload: T, options: { ttl: number }): Promise<Boolean>`
Serializes the object and sets it to the database with the corresponding key. Returns true if the key is created.

```ts	
type User = {
    name: string;
    age: number;
};

const user: User = {
    name: "John",
    age: 30,
};

await client.setObject<User>("user:1", user, { ttl: 600 });

```

### `getObject<T = any>(key: string): Promise<T | null>`
Gets and deserializes the object from the database with the corresponding key. Returns the value in object type.

```ts
const user = await client.getObject<User>("user:1");

console.log("User", user);
// { name: 'John', age: 30 }
```

## Timeout API

### `Timeout(opts: redis.CleintOpts): Promise<TimeoutType>`
Creates a new timeout client with redis module client options. It initializes a client to save the data, and a subclient to listen to the timeout events.

```ts	
const timeout = await Timeout({
    host: 'localhost',
    port: 6379,
    password: 'password',
});
```

### `setCallback(cb: Function): void`
Sets the callback that's called when a key expires. There's only a single callback, because redis can only listen to a general key expiration event.

The callback function receives a data parameter, that contains user data passed to the key when it was created.

```ts	
timeout.setCallback(async (data: any) => {
    console.log("Timeout reached", data);
});
```

### `setTimeout<T>(key: string, data: T, timeout = 1): void`
Sets a timeout with the corresponding key. Then the timeout client creates two keys, one to save the data, and another to be listened to. When the timeout is reached, the callback is called and the data is passed to it. After the callback execution, the data key is deleted from the database.

The standard timeout is 1 second.

```ts
type Data = {
    reqId: string;
};

const data: Data = { 
    reqId: "1123-adasd-22221",
};

await timeout.setTimeout<Data>("reqtimeout", data, 10);
```

### `clearTimeout(key: string): void`
Clears the timeout with the corresponding key. It deletes both the listened timeout key and the data key.

```ts
await timeout.clearTimeout("reqtimeout");
```