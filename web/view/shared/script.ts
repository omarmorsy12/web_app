class App {
    static BaseUrl = 'http://192.168.43.6:2000/';
    static ResourcesUrl = App.BaseUrl + 'app/';
}

class AppResource {
    
    public tagName: string;

    constructor(public url: string, public extension: string, public resourcePathName?: string) {
        this.tagName = {
            js: 'script',
            css: 'link',
            ttf: 'link'
        }[extension];
        if (!this.resourcePathName) {
            this.resourcePathName = extension;
        }
    }
}

async function load() {
    const resources = [
        new AppResource('fa-regular-400', 'ttf', 'fontawesome'),
        new AppResource('fa-brands-400', 'ttf', 'fontawesome'),
        new AppResource('fa-solid-900', 'ttf', 'fontawesome'),
        new AppResource('models/page', 'js'),
        new AppResource('components/component', 'js'),
        new AppResource('models/component-ref', 'js'),
        new AppResource('models/utils', 'js'),
        new AppResource('models/module', 'js'),
        new AppResource('all.min', 'js', 'fontawesome')
    ];

    for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        const fullUrl = App.ResourcesUrl + resource.resourcePathName + '/' + resource.url + '.' + resource.extension;
        const el = document.createElement(resource.tagName);
        const isLink = resource.tagName === 'link';

        if (isLink) {
            el.setAttribute('rel', 'stylesheet');
        }

        el.setAttribute(isLink ? 'href' : 'src', fullUrl);
        document.head.appendChild(el);
        await new Promise<void>(resolve => el.onload = () => resolve());
    }

    Module.initMainComponents([
        new ComponentRef('app-body', { skipRenderOnInit: true }),
        new ComponentRef('nav-bar')
    ]);

    ResourcesLoader.load(document.body);
}

load();