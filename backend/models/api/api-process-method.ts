import { ApiParams } from './api-params';

export interface ApiProcessMethod<R, K> {
    (apiParams: ApiParams<R, K>): any;
}