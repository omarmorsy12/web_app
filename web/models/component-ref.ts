class ComponentRef {
    
    public src: string;
    public type: string;

    constructor(public selector: string, public config?: ComponentConfig) {
        this.src = 'components/' + this.selector + '-component';
        this.type = this.getComponentClass();
    }

    private getComponentClass() {
        return (' ' + this.selector + '-component').replace(/\-/g, ' ').toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()).trim();
    }

    public create(): Component {
        const Class = Components[this.type];
        return new Class(this.selector);
    }

}
