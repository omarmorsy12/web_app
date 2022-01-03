new Module(PageName.OTHER, [
    new ComponentRef('expandable-list'),
    new ComponentRef('expandable-list-item',{ noStyle: true })
]) .render();