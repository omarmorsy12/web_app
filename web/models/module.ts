interface ModuleComponents { ref: ComponentRef, elements: HTMLElement[] }

class Module {
    
    public static currentPage: Page;
    private static components: ModuleComponents[] = [];
    private static mainComponents: ModuleComponents[] = [];
    private static mainComponentInstances: Component[] = [];
    private static componentInstances: Component[] = [];
    private static resourcesElement = document.createElement('app-components-resources');
    private static lastRenderPromise: Promise<any>;

    public static getComponentById<T extends Component = Component>(id: string): T {
        return <T>(this.componentInstances.concat(this.mainComponentInstances)).find((c) => c.element.id === id);
    }

    public static getComponentsByType<T extends Component = Component>(type: T): T[] {
        return <T[]>(this.componentInstances.concat(this.mainComponentInstances)).filter((c) => c.constructor.name === type.constructor.name);
    }
    
    public static getComponentBySelector<T extends Component = Component>(selector: string): T {
        return <T>(this.componentInstances.concat(this.mainComponentInstances)).find((c) => c.selector === selector);
    }
    
    public static getComponentsBySelector<T extends Component = Component>(selector: string): T[] {
        return <T[]>(this.componentInstances.concat(this.mainComponentInstances)).filter((c) => c.selector === selector);
    }

    private static async loadResources(component: ComponentRef, isMainComponent?: boolean) {
        const src = component.src;
        
        if (!component.config?.noStyle) {
            await this.loadResource(src + '-style', 'css', isMainComponent);
        }
        
        try {
            component.create();
        } catch (error) {
            const jsElemnet: HTMLElement = await this.loadResource(src, 'js', isMainComponent);
            jsElemnet.setAttribute('component-type', component.type);
        }
    }

    private static initComponent(element: HTMLElement, component: ModuleComponents, parentComponent?: Component, isMainComponent?: boolean) {        
        const componentRef: Component = component.ref.create();

        Array.from(element.getElementsByTagName(componentRef.selector)).forEach((e) => {
            const el = <HTMLElement>e;
            if (component.elements.includes(el)) {
                if (parentComponent) {
                    const component = Module.componentInstances.find((c) => c.element === el);
                    if (!parentComponent.children.includes(component)) {
                        parentComponent.children.push(component);
                    }
                }
                return;
            } else {
                component.elements.push(el);
            }

            el['inputs'] = {};

            const instance = <ComponentAfterInit> component.ref.create();
            instance.element = el;
            instance.children = [];
            const ignoreRender = component.ref.config?.skipRenderOnInit;

            if (parentComponent) {
                parentComponent.children.push(instance);
            }

            if (!ignoreRender) {
                instance.internalRender();
            }
            
            const tagNames = Array.from(instance.element.children).map(child => child.tagName);
            
            const innerComponents = Module.components.filter((c) => tagNames.includes(c.ref.selector.toUpperCase()));
            innerComponents.forEach((ic) => this.initComponent(instance.element, ic, instance));

            if (instance.afterInit) {
                instance.afterInit();
            }

            instance.render = () => {
                const res = instance.internalRender();
                instance.children = instance.children.filter((child) => {
                    const newElement = <HTMLElement>instance.element.querySelector(child.selector);
                    const moduleComponent = Module.components.find((mc) => mc.ref.selector === child.selector);
                    if (!newElement || moduleComponent.elements.includes(newElement)) {
                        return false;
                    }
                    moduleComponent.elements = moduleComponent.elements.filter((el) => el === child.element);
                    child.element = newElement;
                    moduleComponent.elements.push(child.element);
                    return true;
                });
                instance.children.forEach((c) => c.render());
                return res;
            };

            if (el.hasAttribute('sync-with-render') && !el.classList.contains('ready')) {
                el.classList.add('ready');
            }

            if (isMainComponent) {
                Module.mainComponentInstances.push(instance);
            } else {
                Module.componentInstances.push(instance);
            }
        });
    }

    private static loadResource(url: string, extension: 'js' | 'css', isMainComponent: boolean) {
        if (!document.head.contains(this.resourcesElement)) {
            document.head.appendChild(this.resourcesElement);
        }
        const src = App.ResourcesUrl + extension + '/' + url + '.' + extension;
        const tagName = extension === 'js' ? 'script' : 'link';
        const key = extension === 'js' ? 'src' : 'href';

        const isSrcLoaded = Array
            .from(this.resourcesElement.querySelectorAll(tagName))
            .find(e => e.getAttribute(key) === src);
        
        if (isSrcLoaded) {
            return Promise.resolve(null);
        }

        const e = document.createElement(tagName);
        e.setAttribute(key, src);
        if (extension === 'css') {
            e.setAttribute('rel', 'stylesheet');
        }
        e.setAttribute('component-src', url);
        if (isMainComponent) {
            e.setAttribute('main-component', 'true');
        }
        this.resourcesElement.appendChild(e);
        return new Promise<HTMLElement>(resolve => e.onload = () => resolve(e));
    }

    public static initMainComponents(components: Array<ComponentRef>) {
        Module.mainComponents = components.map(ref => ({ elements: [], ref }));
    }

    constructor(page: PageName, components: ComponentRef[]) {
        Module.currentPage = Page.getPageByName(page);
        Module.components = components.map(ref => ({
            ref,
            elements: []
        }));
    }

    async render() {
        // Load Resources
        Module.componentInstances = [];
        const promises = Module.mainComponents.concat(Module.components).map((c, index) => Module.loadResources(c.ref, index < Module.mainComponents.length));
        const renderPromise = Promise.all(promises);
        Module.lastRenderPromise = renderPromise;
        
        await Module.lastRenderPromise;

        if (Module.lastRenderPromise !== renderPromise) {
            return;
        }

        // Render Main Components
        if (!Module.mainComponentInstances.length) {
            Module.mainComponents.forEach(c => Module.initComponent(document.body, c, null, true));
        }

        const body = Module.getComponentBySelector<Components.AppBodyComponent>('app-body');
        body.ready();

        const resourcesSrc: string[] = [];

        // Render Components
        Module.components.forEach(c => {
            Module.initComponent(body.element, c);
            resourcesSrc.push(c.ref.src);
            if (!c.ref.config?.noStyle) {
                resourcesSrc.push(c.ref.src + '-style');
            }
        });

        Array.from(Module.resourcesElement.children).forEach(el => {
            const isMain = !!el.getAttribute('main-component');
            const componentSrc = el.getAttribute('component-src');
            if (!isMain && !resourcesSrc.includes(componentSrc)) {
                el.remove();
                const componentType = el.getAttribute('component-type');
                if (componentType) {
                    delete Components[componentType];
                }
            }
        });

        window.onresize = () => Module.componentInstances.forEach((instance: ResponsiveComponent) => {
            if (instance.onResize) {
                instance.onResize();
            }
        });
    }

}