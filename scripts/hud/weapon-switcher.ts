'use strict';

class WeaponSwitcher {
	static {
		$.RegisterForUnhandledEvent('WeaponSelect', this.weaponSelected.bind(this));
		$.RegisterForUnhandledEvent('WeaponStateChange', this.weaponStateChanged.bind(this));
		$.RegisterForUnhandledEvent('LevelInitPostEntity', this.onLevelInit.bind(this));
		$.RegisterForUnhandledEvent('LayoutReloaded', () => {
			this.updateWeapons();
		});
	}

	static weapons: (Weapon | null)[] | undefined = [];

	static onLoad() {
		
	}

	static onLevelInit() {

	}

	static weaponSelected(action: WeaponSelectAction) {
		$.Msg(`WeaponSelect: ${action}`);
		if (!this.weapons) return;
		//$.Msg(`${JSON.stringify(WeaponsAPI.GetWeapons())}`);
		switch (action) {
			case WeaponSelectAction.NEXT:
				{
					const index = WeaponsAPI.GetActiveWeapon() + 1;
					if (index >= this.weapons.length) {
						WeaponsAPI.SwitchToWeapon(0);
					} else {
						WeaponsAPI.SwitchToWeapon(index);
					}
					break;
				}

			case WeaponSelectAction.PREV:
				{
					const index = WeaponsAPI.GetActiveWeapon() - 1;
					if (index < 0) {
						WeaponsAPI.SwitchToWeapon(this.weapons.length - 1);
					} else {
						WeaponsAPI.SwitchToWeapon(index);
					}
					break;
				}
		
			default:
				break;
		}
	}

	static weaponStateChanged(mode: WeaponStateMode, index: int32) {
		$.Msg(`WeaponStateChange: ${mode}, ${index}`);

		switch (mode) {
			case WeaponStateMode.DROP:
			case WeaponStateMode.PICKUP:
				this.updateWeapons();
				break;
		
			default:
				break;
		}
	}

	static updateWeapons() {
		$.Msg('Updating weapons...');

		this.weapons = WeaponsAPI.GetWeapons();
		if (this.weapons === undefined) {
			$.Warning('Weapons array is undefined');
			return;
		}

		$.Msg(`${this.weapons.length} weapons`);

		for (const weapon of this.weapons) {
			if (!weapon) continue;
			$.Msg(`===== WEAPON: ${weapon.name} (${weapon.classname}), SLOT ${weapon.slot}`);
		}
	}
}
