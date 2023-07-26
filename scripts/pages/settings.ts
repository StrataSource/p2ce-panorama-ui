const Categories = [
	'Audio',
	'Video',
	'Input',
	'Interface'
];

class MainMenuSettings {
	static lastSelected: number|null = null;

	static panels = {
		search:  $('#SettingsSearch')!,
		buttons: $('#SettingsButtons')!,
		pages:   $('#SettingsPages')!,
	}

	static {
		// Create and bind buttons
		for ( let i=0; i<Categories.length; i++ ) {
			this.panels.buttons.CreateChildren(`
				<RadioButton
					group="SettingsGroup"
					onactivate="MainMenuSettings.onSelect(${i})"
				>
					<Label text="${Categories[i]}"/>
				</RadioButton>
			`);
		}

		// Create pages
		for ( let i=0; i<Categories.length; i++ ) {
			const name = Categories[i].toLowerCase();
			const path = `file://{resources}/layout/pages/settings/${name}.xml`;
			const element = $.CreatePanel('Panel', this.panels.pages, '');
			element.LoadLayout(path, false, false);
		}
	}

	static onSelect(selected: number) {
		if (this.lastSelected !== null)
			this.panels.pages.GetChild(this.lastSelected)?.RemoveClass('show');
		this.panels.pages.GetChild(selected)?.AddClass('show');
		this.lastSelected = selected;
	}
}
