import { ApiProcessMethod } from '../models/api/api-process-method';
import { ApiFinalProcessMethod } from '../models/api/api-final-process-method';
import { App } from '../../app';
import { Response } from 'express-serve-static-core';
import { ApiParams } from '../models/api/api-params';
import { RequestType } from '../models/api/request-type';

class ApiPaths {

    /*************** Variables ***************/
    get: string[] = [];
    post: string[] = [];
    put: string[] = [];
    delete: string[] = [];

    /*************** Constructor ***************/
    constructor(public base: string) {}
}

export abstract class Api {

    /*************** Variables ***************/
    protected paths: ApiPaths;
    
    /*************** Constructor ***************/
    constructor(basePath: string) {
        this.paths = new ApiPaths(basePath);
        this.initialize();
    }

    /*************** Methods ***************/
    protected abstract initialize(): void;

    private method(type: RequestType, url: string, finalProcess: ApiFinalProcessMethod<any, any>): void {
        this.paths[type].push(url);
        App.server[type](this.paths.base + url, async (req, res: Response<any>) => {
            const config = finalProcess(new ApiParams(req));
            if (config.renderView) {
                res.render(config.renderView);
            } else if (config.redirectTo) {
                res.redirect(config.redirectTo);
            } else {
                res.end();
            }
        });
    }
    
    protected get(url: string, finalProcess: ApiFinalProcessMethod<any, any>): void {
        this.method(RequestType.GET, url, finalProcess);
    }

    protected post(url: string, finalProcess: ApiFinalProcessMethod<any, any>): void {
        this.method(RequestType.POST, url, finalProcess);
    }

    protected put(url: string, finalProcess: ApiFinalProcessMethod<any, any>): void {
        this.method(RequestType.PUT, url, finalProcess);
    }

    protected delete(url: string, finalProcess: ApiFinalProcessMethod<any, any>): void {
        this.method(RequestType.DELETE, url, finalProcess);
    }

}