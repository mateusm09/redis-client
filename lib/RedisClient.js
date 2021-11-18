"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var redis = require("redis");
function init(_opts) {
    return new Promise(function (resolve, reject) {
        var _client = redis.createClient(_opts);
        _client.on('ready', function () {
            resolve(_client);
        });
        _client.on('error', function (err) {
            reject(err);
        });
    });
}
exports.init = init;
function Client(opts) {
    return __awaiter(this, void 0, void 0, function () {
        function close() {
            return client.quit();
        }
        function clear() {
            return client.flushall();
        }
        function set(key, payload, options) {
            return new Promise(function (resolve, reject) {
                if (client) {
                    client.set(key, payload, function (err, res) {
                        if (err)
                            reject(err);
                        else if (options) {
                            if (options.ttl) {
                                client.expire(key, options.ttl, function (err, res) {
                                    if (err)
                                        reject(err);
                                    else
                                        resolve(true);
                                });
                            }
                            else
                                resolve(true);
                        }
                        else
                            resolve(true);
                    });
                }
                else {
                    reject(new Error('client undefined'));
                }
            });
        }
        function setObject(key, payload, options) {
            return new Promise(function (resolve, reject) {
                if (client) {
                    var serializedJson = JSON.stringify(payload);
                    client.set(key, serializedJson, function (err) {
                        if (err)
                            reject(err);
                        else if (options) {
                            if (options.ttl) {
                                client.expire(key, options.ttl, function (redisErr) {
                                    if (redisErr)
                                        reject(redisErr);
                                    else
                                        resolve(true);
                                });
                            }
                            else
                                resolve(true);
                        }
                        else
                            resolve(true);
                    });
                }
                else {
                    reject(new Error('client undefined'));
                }
            });
        }
        function get(key) {
            return new Promise(function (resolve, reject) {
                if (client) {
                    client.get(key, function (err, reply) {
                        if (err)
                            reject(err);
                        else
                            resolve(reply);
                    });
                }
                else {
                    reject(new Error('client undefined'));
                }
            });
        }
        function getObject(key) {
            return new Promise(function (resolve, reject) {
                if (client) {
                    client.get(key, function (err, reply) {
                        if (err)
                            reject(err);
                        else {
                            var obj = JSON.parse(reply);
                            resolve(obj);
                        }
                    });
                }
                else {
                    reject(new Error('client undefined'));
                }
            });
        }
        function del(key) {
            return new Promise(function (resolve, reject) {
                if (client) {
                    client.del(key, function (err, reply) {
                        if (err)
                            reject(err);
                        else
                            resolve(true);
                    });
                }
                else {
                    reject(new Error('client undefined'));
                }
            });
        }
        var client;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, init(opts).catch(function (err) {
                        throw err;
                    })];
                case 1:
                    client = _a.sent();
                    return [2 /*return*/, {
                            close: close,
                            clear: clear,
                            set: set,
                            setObject: setObject,
                            get: get,
                            getObject: getObject,
                            del: del,
                            client: client,
                        }];
            }
        });
    });
}
exports.default = Client;
