'use strict';

class Workshop {
    element: Panel;
    el_grid: (Panel|null);

	constructor(element: Panel) {
		this.element = element;
		this.element.style.flowChildren = 'none';
        this.el_grid = $("#workshop-grid");


		$.Schedule(0, this.layout.bind(this));

        const addonCount: number = WorkshopAPI.GetAddonCount();
        // "
        // Create and bind buttons
        for ( let i=0; i<addonCount; i++ ) {
            const meta: AddonMeta =  WorkshopAPI.GetAddonMeta(i);
            
            this.el_grid?.CreateChildren(`
            <Panel w="1" h="1" onactivate="Workshop.onSelect(${i})">
                <Label text="${meta.name}" />
                <Image class="button__icon" texturewidth="32" textureheight="32" src="${meta.icon_big}" />
                </Panel>
            `);
        }

	}
    
	static init(selector: string) {
		const panel = $(selector);
		if (!panel) throw(`Could not locate panel with selector "${selector}"!`);

		$.Schedule(0, () => {
			const grid = new Workshop(panel);
			panel.SetPanelEvent('DoLayout', () => grid.layout());
			panel.SetPanelEvent('DoRender', () => grid.render());
		});
	}

    layout() {
    
    }

    render() {

    }

    static onSelect(index: number) {
        $.Msg(`got ${index}\n`);
        const meta: AddonMeta =  WorkshopAPI.GetAddonMeta(index);
        GameInterfaceAPI.ConsoleCommand(`map workshop/${meta.uuid}/${meta.filename}`);
    }

}
