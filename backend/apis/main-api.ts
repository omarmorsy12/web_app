import { Api } from "./api";
import { ApiFinalProcessConfig } from "../models/api/api-final-process-config";
import * as fs from 'fs';
import { App } from '../../app';
import { AsyncComponent } from "../models/async-component";

export class MainApi extends Api implements AsyncComponent {

    /*************** Methods ***************/
    protected initialize(): void {
        this.get('', this.getHomePage);
        this.get('other', this.getOtherPage);
    }
    
    async asyncInit(): Promise<void> {
        await this.loadResources();
    }
    
    getClassRef() {
        return MainApi;
    }

    getHomePage(): ApiFinalProcessConfig {
        return {
            renderView: 'home-page.html'
        };
    }
    
    getOtherPage(): ApiFinalProcessConfig {
        return {
            renderView: 'other-page.html'
        };
    }
    
    private async readResources(dir: string): Promise<{ [dir: string]: [] }> {
        const promises = [];
        await new Promise<void>( (resolve) => fs.readdir(dir, (err, files) => {
            const filePaths = {};
            if (!err) {
                files.forEach(async (filename) => {
                    const path = dir + '/' + filename;
                    if (filename.includes('.')) {
                        if (!filePaths[dir]) {
                            filePaths[dir] = [];
                        }
                        filePaths[dir].push(path);
                    } else if (!filename.includes('.')) {
                        promises.push(this.readResources(path));
                    }
                });
                promises.push(Promise.resolve(filePaths));
            }
            resolve();
        }));
        let result = {};
        await Promise.all(promises).then((values) => {
            values.forEach((v) => result = { ...result, ...v });
        });
        return result;
    }

    private async readViewFiles(isComponentsCss?: boolean) {
        const directory = App.directory + '/../web/' + (isComponentsCss ? 'components': 'view');
        return this.readResources(directory).then((value) => {
            Object.keys(value).forEach((directory) => {
                const files = value[directory];
                const htmlFiles = files.filter((value: string) => value.includes('.html'));
                const containsCss = files.find((value: string) => value.includes('.css'));
                const containsHtml = htmlFiles && htmlFiles.length != 0;
                const containsImage = files.find((value: string) => value.includes('.png') || value.includes('.jpg'));
                
                const folderName = this.getFolderName(directory);

                if (containsCss) {
                    App.loadCssResource(folderName, directory);
                }
                if (containsHtml) {
                    App.loadView(directory);
                } 
                if (containsImage) {
                    App.loadImageResource(folderName, directory);
                }
            });
        });
    }

    private async readScripts() {
        const directory = App.directory + '/web';
        return this.readResources(directory).then((value) => {
            Object.keys(value).forEach((directory) => {
                const files = value[directory];
                const containsJS = files.find((value: string) => value.includes('.js'));
                const folderName = this.getFolderName(directory);

                if (containsJS) {
                    App.loadJsResource(folderName, directory);
                }
            });
        });
    }
    
    private async readFontAwesome() {
        const directory = App.directory + '/../web/fontawesome';
        App.loadResource('fontawesome', directory);
    }

    private getFolderName(directory: string) {
        return directory.includes('web/components') ? 'components' : directory.split('/').pop();
    }

    protected async loadResources(): Promise<void> {
        await this.readViewFiles();
        await this.readViewFiles(true);
        await this.readScripts();
        this.readFontAwesome();
    }
    
}