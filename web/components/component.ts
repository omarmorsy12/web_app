interface ComponentConfig {
    skipRenderOnInit?: boolean
    noStyle?: boolean
}

abstract class Component {
    public element: HTMLElement;
    public children: Component[];
    
    constructor(public selector: string) {}

    abstract internalRender(): Promise<void> | void;

    public render:() => Promise<void> | void;

    public Input<T = string>(key: string, config?: ComponentInputConfig) {
        return new ComponentInput<T>(key, this, config);
    }

    public ClassInput(className: string) {
        const config = new ComponentInputConfig();
        config.syncClass = true;
        return new ComponentInput<boolean>(className, this, config);
    }
}

interface ComponentAfterInit extends Component {
    afterInit(): void;
}

interface ResponsiveComponent extends Component {
    onResize?(): void;
}

class ComponentInputConfig {
    public syncAttribute = true;
    public syncClass: boolean;
}

class ComponentInput<T> {

    constructor(private key: string, private component: Component, private config = new ComponentInputConfig()) {}

    private onValueChange: (newValue: T) => void;

    get(): T {
        const value = this.component.element ? this.component.element['inputs'][this.key] : null;
        if (value) {
            return value;
        }
        if (this.config.syncClass) {
            return <T><any>this.component.element?.classList.contains(this.key);
        }
        return <T><any> this.component.element?.getAttribute(this.key);
    }

    set(value: T, silent?: boolean) {
        if (this.component.element) {
            if (!this.config.syncClass && this.config.syncAttribute) {
                this.component.element.setAttribute(this.key, value.toString());
            }
            if (this.config.syncClass) {
                if (!value) {
                    this.component.element.classList.remove(this.key);
                } else if (!this.component.element.classList.contains(this.key)) {
                    this.component.element.classList.add(this.key);
                }
            }
            this.component.element['inputs'][this.key] = value;
        }
        if (this.onValueChange && !silent) {
            this.onValueChange(value);
        }
        return this;
    }

    public onChange(action: (newValue: T) => void) {
        this.onValueChange = action;
        return this;
    }

}