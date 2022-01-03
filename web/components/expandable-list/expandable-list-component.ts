namespace Components {
    export class ExpandableListComponent extends Component implements ComponentAfterInit {

        public selected: ExpandableListItemComponent;
        
        internalRender(): void | Promise<void> {}

        afterInit(): void {
            this.children.forEach((item: ExpandableListItemComponent) => {
                item.onClick = () => {
                    if (item.showContent.get()) {
                        if (this.selected && this.selected != item) {
                            this.selected.showContent.set(false);
                        }
                        this.selected = item;
                    } else {
                        this.selected = null;
                    }
                };
            });
        }

    }
}