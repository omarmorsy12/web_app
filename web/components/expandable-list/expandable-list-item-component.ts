namespace Components {
    export class ExpandableListItemComponent extends Component {
    
        public onClick: () => void;
    
        public header = this.Input('header');
        public showContent = this.ClassInput('show-content');
        
        internalRender(): void | Promise<void> {
            let headerElement = <HTMLElement> this.element.querySelector('.item-header');
            if (!headerElement) {
                headerElement = document.createElement('div');
                headerElement.classList.add('item-header', 'default');
                headerElement.innerHTML = `
                    <i class="fas fa-caret-right"></i>
                    <i class="fas fa-caret-down"></i>
                    <span class="item-header-title">${this.header.get()}</span>
                `;
                this.element.insertBefore(headerElement, this.element.childNodes[0]);
            }
    
            headerElement.onclick = () => {
                this.showContent.set(!this.showContent.get());
                if (this.onClick) {
                    this.onClick();
                }
            };
        }
    
    }
}