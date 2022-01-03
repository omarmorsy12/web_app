namespace Components {
    export class AppBodyComponent extends Component {
    
        private lastRequest: AppRequest;
    
        constructor(selector: string) {
            super(selector);
    
            window.onpopstate = () => {
                const pathName = window.location.pathname;
                const navBar = Module.getComponentBySelector<NavBarComponent>('nav-bar');
    
                if (pathName === '/') {
                    Module.currentPage = Page.INSTANCES.HOME;
                } else {
                    const others = Page.ALL.slice(1);
                    const currentPage = others.find(page => pathName.startsWith('/' + page.name.toString()));
                    if (currentPage) {
                        Module.currentPage = currentPage;
                    }
                }
                
                navBar.updateNav();
                this.updateLocationState();
            };
        }
    
        updateLocationState() {
            this.element.innerHTML = '';
            this.internalRender();
        }
    
        changeLocation(page: Page, ignoreRendering?: boolean) {
            history.pushState({}, 'Localhost', '/');
            history.replaceState({}, 'Localhost', page.url);
            if (!ignoreRendering) {
                this.updateLocationState();
            }
        }
    
        async internalRender(): Promise<void> {
            if (this.lastRequest) {
                this.lastRequest.httpRequest.abort();
            }
            
            const request = ServerRequest.request('GET', Module.currentPage.url);
            this.lastRequest = request;
    
            const html = await request.promise;
    
            if (this.lastRequest === request) {
                const div = document.createElement('div');
        
                div.innerHTML = html;
                
                const loader = ResourcesLoader.createLoader(div);
                await loader.loadCss();
                this.element.innerHTML = div.querySelector('app-body')?.innerHTML;
                loader.loadJs();
            }
        }
    
        public ready() {
            if (!this.element.classList.contains('ready')) {
                this.element.classList.add('ready');
            }
        }
    
    }
}

