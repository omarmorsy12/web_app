import express from 'express';
import { Express } from 'express-serve-static-core';
import { MainApi } from './backend/apis/main-api';
import { AsyncComponent } from './backend/models/async-component';

export class App {

    /*************** Variables ***************/
    public static directory = __dirname;
    public static server: Express;
    private static views: Array<string> = [];
    private static resources: Array<string> = [];

    /*************** Methods ***************/
    
    public static loadView(path: string): void {
        if (!this.views.includes(path)) {
            this.views.push(path);
            this.server.set('views', this.views);
        }
    }

    public static loadResource(name: string, path: string, extension?: string) {
        const key = path + (extension ? '-' + extension : '');
        if (!this.resources.includes(key)) {
            const exts = extension ? '/' + extension : '';
            this.server.use('/app' + exts + '/'+ name, express.static(path));
            this.resources.push(key);
        }
    }

    public static loadCssResource(name: string, path: string) {
        this.loadResource(name, path, 'css');
    }

    public static loadJsResource(name: string, path: string) {
        this.loadResource(name, path, 'js');
    }

    public static loadImageResource(name: string, path: string) {
        this.loadResource(name, path, 'image');
    }

    private initApp(): void {
        const bodyParser = require('body-parser');
        const server: Express = express();
        server.use(bodyParser.urlencoded({ extended: false }));
        server.use(bodyParser.json());
        server.set('view engine', 'ejs');
        server.set('view options', { layout: false });
        server.engine('html', require('ejs').renderFile);

        App.server = server;
    }

    
    private async initAsyncComponents(components: Array<any>): Promise<void> {
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            if (AsyncComponent.implementedBy(component)) {
                await (<AsyncComponent>component).asyncInit();
            }
        }
    }

    public initialize(): Promise<App> {
        this.initApp();
        
        const apis = [
            new MainApi('/')
        ];

        return this.initAsyncComponents(apis).then(() => this);
    }

    public start(port: number, message?: string): App {
        App.server.listen(port, () => {
            if (message) {
                console.log(message);
            }
        });
        return this;
    }

}