namespace Components {
  export class NavBarComponent extends Component {

    public openNewWindow: boolean;

    public updateNav() {
      const anchorsA = this.element.querySelectorAll('.anchors a');
      const currentSelected = this.element.querySelector('.anchors a.link.selected');
      const indexes: {[tagName in PageName]?: number} = {
        home: 0,
        other: 1
      };

      const index = indexes[Module.currentPage.name];
      
      if (currentSelected) {
        currentSelected.classList.remove('selected');
      }

      if(index !== undefined && index !== null) {
        anchorsA.item(index).classList.add('selected');
      }
      const titleEl = document.head.querySelector('title') || document.createElement('title');
      titleEl.innerHTML = Module.currentPage.title;
      if (!document.head.contains(titleEl)) {
        document.head.appendChild(titleEl);
      }
    }

    changeLocation(page: Page) {
      if (Module.currentPage === page) {
        return;
      }

      Module.currentPage = page;

      this.updateNav();

      const body = Module.getComponentBySelector<Components.AppBodyComponent>('app-body');
      if (body) {
        body.changeLocation(Module.currentPage);
      }
    }

    internalRender(): void {
      this.element.innerHTML = `
      <nav class="navbar">
          <h3 class="title">
            <span class="p1">Web</span>
            <span class="p2">.</span>
            <span class="p3">App</span>
          </h3>
          <div class="anchors">
            <a page-name="home" class="link"><i class="fas fa-home"></i> Home</a>
            <a page-name="other" class="link"><i class="fas fa-bars"></i> Other</a>
          </div>
      </nav>
      `;
      this.updateNav();
      this.element.querySelectorAll('.anchors a').forEach((el: HTMLElement) => {
        el.onclick = (e) => {
          const pageName = <PageName> el.getAttribute('page-name');
          const config = Page.getPageByName(pageName);
          if (e.ctrlKey || e.metaKey) {
            window.open(config.fullURL);
          } else {
            this.changeLocation(config);
          }
        };
      });
    }
  }
}