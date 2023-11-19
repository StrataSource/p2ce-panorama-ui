const Categories = [
	'Audio',
	'Video',
	'Input',
	'Interface'
];

class SettingsMenu {
	static lastSelected: number|null = null;

	static panels = {
		root:    $.GetContextPanel(),
		search:  $('#search')!,
		buttons: $('#categories')!,
		pages:   $('#body')!,
	}

	static {
		$.RegisterForUnhandledEvent('MainMenu.TabSelected', (tab) => {
			if (tab === 'settings') this.onSettingsShown();
			else this.onSettingsHidden();
		});

		// Create and bind buttons
		for ( let i=0; i<Categories.length; i++ ) {
			this.panels.buttons.CreateChildren(`
				<RadioButton
					group="SettingsGroup"
					onactivate="SettingsMenu.onSelect(${i})"
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

	static onSettingsShown() {
		this.panels.root.RemoveClass('pre-trans');
	}

	static onSettingsHidden() {
		this.panels.root.AddClass('pre-trans');
	}

	static onSelect(selected: number) {
		if (this.lastSelected === selected) return;
		$.PlaySoundEvent('UI.Unclick');

		if (this.lastSelected !== null)
			this.panels.pages.GetChild(this.lastSelected)?.RemoveClass('show');
		this.panels.pages.GetChild(selected)?.AddClass('show');
		this.lastSelected = selected;
	}
}
