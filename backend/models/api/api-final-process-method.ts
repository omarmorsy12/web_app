import { ApiFinalProcessConfig } from './api-final-process-config';
import { ApiParams } from './api-params';

export interface ApiFinalProcessMethod<R, K> {
    (apiParams: ApiParams<R, K>): ApiFinalProcessConfig;
}