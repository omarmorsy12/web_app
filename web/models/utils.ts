class AppRequest<T = any> {
    constructor(public httpRequest: XMLHttpRequest, public promise: Promise<T>) {}
}

class Http {
    public static request(type: 'GET' | 'POST', url: string, body?: any) {
        const xhttp = new XMLHttpRequest();
        const promise = new Promise<string>((resolve) => {
            xhttp.onload = () => resolve(xhttp.responseText);
            xhttp.onabort = () => resolve('');
            xhttp.open(type, url, true);
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.send(body ? JSON.stringify(body) : null);
        });

        return new AppRequest<string>(xhttp, promise);
    }
}

class ServerRequest {

    public static requestObject<R>(type: 'GET' | 'POST', url: string, body?: any) {
        const request = Http.request(type, App.BaseUrl + url, body);
        return new AppRequest<R>(request.httpRequest, request.promise.then((res) => <R>JSON.parse(res)));
    }
    
    public static request(type: 'GET' | 'POST', url: string, body?: any) {
        return Http.request(type, App.BaseUrl + url, body);
    }

}

class ResourcesLoader {
    
    static resourcesElement: HTMLElement;

    static createLoader(fromElement: HTMLElement) {
        if (!this.resourcesElement) {
            this.resourcesElement = document.createElement('app-resources');
            document.head.appendChild(this.resourcesElement);
        } else {
            this.resourcesElement.innerHTML = '';
        }
        const resources = fromElement.querySelector('app-resources');
        resources.remove();
        const el : { [tageName: string]: { tagName: string, keys: string[] } } = {
            'app-link': {
                tagName: 'link',
                keys: [ 'rel', 'href' ]
            },
            'app-script': {
                tagName: 'script',
                keys: [ 'src' ]
            }
        }

        const styles = Array.from(resources.children).filter(e => e.tagName.toLocaleLowerCase() === 'app-link');
        const js = Array.from(resources.children).filter(e => e.tagName.toLocaleLowerCase() === 'app-script');
        
        const loader = (children) => {
            const promises = [];
            children.forEach(element => {
                const type = element.tagName.toLocaleLowerCase();
                const config = el[type];
                const e = document.createElement(config.tagName);
                config.keys.forEach((key) => {
                    const refValue = element.getAttribute(key);
                    const addUrlRef = ['href' , 'src'].includes(key);
                    const urlRef = { 'app-link': 'css', 'app-script': 'js' }[type];
                    const value =  addUrlRef && urlRef ? App.ResourcesUrl + urlRef + '/' + refValue : refValue;
                    e.setAttribute(key, value);
                });
                promises.push(new Promise<void>(resolve => e.onload = () => resolve()));
                this.resourcesElement.appendChild(e);
            });
            return Promise.all(promises);
        }

        return {
            loadCss: () => loader(styles),
            loadJs: () => loader(js)
        };
    }
    
    static load(fromElement: HTMLElement) {
        const loader = this.createLoader(fromElement);
        return Promise.all([
            loader.loadCss(),
            loader.loadJs()
        ]);
    }

}