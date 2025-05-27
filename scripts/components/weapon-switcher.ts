// TODO: This file is extremely unfinished and
// causes lots of typescript errors. Just ignore them!

class HudWeaponSwitcher {
	static state: {
		tab: number|null,
		weapon: number|null,
	} = {
		tab: null,
		weapon: null,
	}

	static tabs: any[];
	static root = $.GetContextPanel();
	static hideDelay: uuid|null = null;
	static resetDelay: uuid|null = null;

	/** Initializes the HUD. */
	static init() {
		$.RegisterForUnhandledEvent('WeaponSelect', (action) => {
			$.Msg('action ', action);
			if (action === WeaponSelectAction.SHOW) {
				this.root.AddClass('active');
				$.Msg('Showing weapons hud');
				const weapons = WeaponsAPI.GetWeapons();
				$.Msg(weapons);
				// for (const weapon of weapons) {
				// 	$.Msg('Weapon', weapon);
				// }
			}
			if (action === WeaponSelectAction.HIDE) {
				this.root.RemoveClass('active');
				$.Msg('Hiding weapons hud');
			}
		});

		$.RegisterForUnhandledEvent('WeaponStateChange', (mode, index) => {
			$.Msg('state ', mode, ', ', index);
		});

		const weapons = WeaponsAPI.GetWeapons();
		$.Msg(weapons);
		// for (const weapon of weapons) {
		// 	$.Msg('Weapon', weapon);
		// }
	}

	/** Fade out the HUD, and start a timer to reset the state. Called automatically, but can be done manually too. */
	static rest() {
		this.hideDelay = null;
		this.root.RemoveClass('active');

		// Reset the UI state when the panel finishes hiding.
		this.resetDelay = $.Schedule(0.2, () => {
			this.resetDelay = null;
			if (this.state.tab !== null) {
				this.#setTabFocused(this.state.tab, false);
				if (this.state.weapon !== null) this.#setWeaponFocused(this.state.tab, this.state.weapon, false);
			}
			this.state.tab = null;
			this.state.weapon = -1;
		});
	}

	/** Focus the next selectable weapon.
	 * @param {number} index
	 */
	static move(index: number) {
		const tab = this.tabs[index];

		if (tab == null) return;
		if (!tab.enabled || !tab.ammo) return;

		if (this.resetDelay !== null) $.CancelScheduled(this.resetDelay);
		this.resetDelay = null;
		if (this.hideDelay !== null) $.CancelScheduled(this.hideDelay);
		this.hideDelay = $.Schedule(1.0, this.rest.bind(this));

		$.PlaySoundEvent('Player.WeaponSelectionMoveSlot');
		this.root.AddClass('active');

		if (this.state.tab !== null) {
			if (this.state.weapon !== null) this.#setWeaponFocused(this.state.tab, this.state.weapon, false);
			if (this.state.tab !== index) {
				this.#setTabFocused(this.state.tab, false);
				this.state.weapon = -1;
			}
		}

		this.#setTabFocused(index, true);
		this.state.tab = index;
		this.state.weapon ??= -1;

		// Select the next unlocked weapon
		const max = tab.weapons.length;
		const initial_id = this.state.weapon;
		for ( let i=0; i<max; i++) {
			const new_id = (initial_id + i + 1) % max;
			const new_weapon = tab.weapons[new_id];
			if (new_weapon.enabled && new_weapon.ammo) {
				this.state.weapon = new_id;
				break;
			}
		}

		// Select the new weapon
		this.#setWeaponFocused(index, this.state.weapon, true);
	}

	/** Select the currently-focused weapon. */
	static close() {
		if (this.hideDelay === null) return;
		if (this.resetDelay !== null) return;
		if (this.state.tab === null || this.state.weapon === null) return;

		const weapon_id = this.tabs[this.state.tab].weapons[this.state.weapon].id;
		GameInterfaceAPI.ConsoleCommand(`use ${weapon_id}`);

		$.CancelScheduled(this.hideDelay);
		this.rest();

		$.PlaySoundEvent('Player.WeaponSelectionClose');
	}

	/** Creates a new tab with the specified weapons.
	 * @param {WeaponArg[]} weapons
	 */
	static #createTab(weapons: WeaponArg[]) {
		const tab: Tab = { enabled: false, ammo: false, weapons: weapons as Weapon[] };
		this.tabs.push(tab);

		const container = $.CreatePanel('Panel', this.root, '', { class: 'ws-tab' });
		container.CreateChildren(`
			<Panel class="ws-tab-default"></Panel>
			<Panel class="ws-tab-focus"></Panel>
			<Label text="${ this.tabs.length }" />
		`);

		const focusPanel = container.GetChild(1)!;

		for (let i=0; i<weapons.length; i++) {
			const weapon = weapons[i];

			weapon.enabled ??= false;
			weapon.ammo ??= true;
			tab.enabled ||= weapon.enabled;
			tab.ammo ||= weapon.ammo;

			this.lookup[weapon.id] = [this.tabs.length-1, i];

			focusPanel.CreateChildren(`
				<Panel class="ws-content ${weapon.enabled ? '' : 'ws-disabled'} ${weapon.ammo ? '' : 'ws-no-ammo'}">
					<Label text="${weapon.icon}" class="icon" />
					<Label text="${weapon.name}" class="subtitle" />
				</Panel>
			`);
		}

		if (!tab.enabled) container.AddClass('ws-disabled');
	}

	/** Sets the focus state of a tab.
	 * @param {number} id
	 */
	static #setTabFocused(id: number, focus: boolean) {
		this.root.GetChild(id)!.SetHasClass('focus', focus);
	}

	/** Sets the focus state of a weapon within a tab. */
	static #setWeaponFocused(tab: number, id: number, focus: boolean) {
		const element = this.root.GetChild(tab)!.GetChild(1)!.GetChild(id)!;
		element.SetHasClass('focus', focus);
		if (focus) element.TriggerClass('ws-highlight');
	}

	/** Updates the specified weapon's unlock state. */
	static setWeaponEnabled(id: string, enabled: boolean) {
		if (!(id in this.lookup)) throw(`PEE_WeaponSwitcher: Weapon "${id}" not registered!`);
		const [tab_id, weapon_id] = this.lookup[id];
		const tab = this.tabs[tab_id];
		const weapon = tab.weapons[weapon_id];
		weapon.enabled = enabled;

		if (!enabled && tab.enabled) {
			tab.enabled = false;
			for (const w of this.tabs[tab_id].weapons) {
				if (w.enabled) { tab.enabled = true; break }
			}
		}
		else {
			tab.enabled = true;
		}

		const tab_element = this.root.GetChild(tab_id)!;
		tab_element.SetHasClass('ws-disabled', !tab.enabled);
		tab_element.GetChild(1)!.GetChild(weapon_id)!.SetHasClass('ws-disabled', !weapon.enabled);
	}

	/** Updates the specified weapon's ammo state. */
	static setWeaponHasAmmo(id: string, has_ammo: boolean) {
		if (!(id in this.lookup)) throw(`PEE_WeaponSwitcher: Weapon "${id}" not registered!`);
		const [tab_id, weapon_id] = this.lookup[id];
		const tab = this.tabs[tab_id];
		const weapon = tab.weapons[weapon_id];
		weapon.ammo = has_ammo;

		if (!has_ammo && tab.ammo) {
			tab.ammo = false;
			for (const w of this.tabs[tab_id].weapons) {
				if (w.ammo) { tab.ammo = true; break }
			}
		}
		else {
			tab.ammo = true;
		}

		const tab_element = this.root.GetChild(tab_id)!;
		tab_element.GetChild(1)!.GetChild(weapon_id)!.SetHasClass('ws-no-ammo', !weapon.ammo);
	}

	/** Resets all weapons to the specified state. */
	static resetState(enabled=false, has_ammo=true) {
		for (let t=0; t<this.tabs.length; t++) {
			const tab = this.tabs[t];
			tab.ammo = has_ammo;
			tab.enabled = enabled;

			const tab_element = this.root.GetChild(t)!;
			tab_element.SetHasClass('ws-disabled', !enabled);

			for (let w=0; w<tab.weapons.length; w++) {
				const weapon = tab.weapons[w];
				weapon.ammo = has_ammo;
				weapon.enabled = enabled;

				const weapon_element = tab_element.GetChild(1)!.GetChild(w)!;
				weapon_element.SetHasClass('ws-disabled', !enabled);
				weapon_element.SetHasClass('ws-no-ammo', !has_ammo);
			}
		}
	}
}