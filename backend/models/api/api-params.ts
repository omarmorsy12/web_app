import { ParamsDictionary, Request } from 'express-serve-static-core';

export class ApiParams<RequestBody = any, PreviousData = any, Storage = any> {
    constructor(public req?: Request<ParamsDictionary, any, RequestBody>, public previousData?: PreviousData, public storage?: Storage) {}
}