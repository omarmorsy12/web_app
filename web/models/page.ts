enum PageName {
    HOME = 'home',
    OTHER = 'other'
}

class Page {

    static INSTANCES = {
        HOME: new Page(PageName.HOME, 'Web.App', ''),
        OTHER: new Page(PageName.OTHER, 'Other')
    };

    static ALL: Page[] = Object.keys(Page.INSTANCES).map(key => Page.INSTANCES[key]);

    static getPageByName(name: PageName) {
        return Page.ALL.find(config => config.name === name);
    }

    private constructor(public name: PageName, public title: string, public url?: string) {
        const defaultURL = url === undefined || url === null;
        if (defaultURL) {
            this.url = name.toString();
        }
    }

    get fullURL() {
        return App.BaseUrl + this.url;
    }
}