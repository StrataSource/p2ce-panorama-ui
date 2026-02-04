'use strict';

class SwitcherData {
	id: uint32;
	weapon: Weapon;
	panel: Panel | undefined = undefined;

	constructor(id: uint32, w: Weapon) {
		this.id = id;
		this.weapon = w;
	}

	setPanel(p: Panel) {
		this.panel = p;
	}
}

class WeaponSwitcher {
	static {
		$.RegisterForUnhandledEvent('WeaponSelect', this.weaponSelected.bind(this));
		$.RegisterForUnhandledEvent('WeaponStateChange', this.weaponStateChanged.bind(this));
		$.RegisterForUnhandledEvent('LevelInitPostEntity', this.onLevelInit.bind(this));
		$.RegisterForUnhandledEvent('LayoutReloaded', () => {
			this.updateWeapons();
			this.hide();
		});
	}

	static weapons: (Weapon | null)[] | undefined = [];
	static bucketedWeapons: SwitcherData[][] = [];
	static selectedIndex: number[] = [0, 0];
	static fadeTimer: uuid | undefined = undefined;

	// how many buckets should ALWAYS appear
	// if no weapons exist in them, it's blank
	// similar to hl2 behavior
	static MIN_NUM_BUCKETS = 6;

	static onLoad() {}

	static onLevelInit() {
		// force refresh, for saved games
		$.Schedule(0.1, () => {
			this.updateWeapons();
			this.hide();
		});
	}

	static setIndexSelectionState(selected: boolean) {
		if (this.bucketedWeapons[this.selectedIndex[0]]) {
			const info = this.bucketedWeapons[this.selectedIndex[0]][this.selectedIndex[1]];
			if (info) {
				if (info.panel && info.panel.IsValid()) {
					// expand the whole bucket
					for (const pod of this.bucketedWeapons[this.selectedIndex[0]]) {
						if (pod.panel && pod.panel.IsValid()) {
							pod.panel.SetHasClass('weapons__bucket__entry__expanded', selected);
						}
					}
					// make THIS one glowy
					info.panel.SetHasClass('weapons__bucket__entry__selected', selected);
				} else {
					$.Warning(`WEAPON SELECT: Data for '${info.weapon.classname}' exists, but the panel is invalid`);
				}
			} else {
				$.Warning(`WEAPON SELECT: index pair 2, ${this.selectedIndex[1]}, is invalid`);
			}
		} else {
			$.Warning(`WEAPON SELECT: index pair 1, ${this.selectedIndex[0]}, is invalid`);
		}
	}

	static show() {
		$.GetContextPanel().style.animation = 'FadeIn 0.01s ease-out 0s 1 normal forwards';
	}

	static hide() {
		$.GetContextPanel().style.animation = 'FadeOut 0.01s ease-out 0s 1 normal forwards';
		const kfs = $.GetContextPanel().CreateCopyOfCSSKeyframes('FadeOut');
		$.GetContextPanel().UpdateCurrentAnimationKeyframes(kfs);
	}

	static fadeOutTimer() {
		if (this.fadeTimer !== undefined) $.CancelScheduled(this.fadeTimer);
		this.fadeTimer = $.Schedule(0.5, () => {
			$.GetContextPanel().style.animation = 'FadeOut 1.5s ease-out 0s 1 normal forwards';
			const kfs = $.GetContextPanel().CreateCopyOfCSSKeyframes('FadeOut');
			$.GetContextPanel().UpdateCurrentAnimationKeyframes(kfs);
			this.fadeTimer = undefined;
		});
	}

	static moveSelectorNext() {
		if (this.weapons?.length === 0) return;

		this.selectedIndex[1] += 1;
		if (this.selectedIndex[1] >= this.bucketedWeapons[this.selectedIndex[0]].length) {
			do {
				this.selectedIndex[0] += 1;
				if (this.selectedIndex[0] >= this.bucketedWeapons.length) {
					this.selectedIndex[0] = 0;
				}
			} while (!this.bucketedWeapons[this.selectedIndex[0]]);
			this.selectedIndex[1] = 0;
		}
	}

	static moveSelectorBack() {
		if (this.weapons?.length === 0) return;

		this.selectedIndex[1] -= 1;
		if (this.selectedIndex[1] < 0) {
			do {
				this.selectedIndex[0] -= 1;
				if (this.selectedIndex[0] < 0) {
					this.selectedIndex[0] = this.bucketedWeapons.length - 1;
				}
			} while (!this.bucketedWeapons[this.selectedIndex[0]]);
			this.selectedIndex[1] = this.bucketedWeapons[this.selectedIndex[0]].length - 1;
		}
	}

	static selectWeapon() {
		const data = this.bucketedWeapons[this.selectedIndex[0]][this.selectedIndex[1]];
		this.setIndexSelectionState(true);
		if (!WeaponsAPI.SwitchToWeapon(data.id)) {
			$.Warning(`Weapon switch to '${data.weapon.classname}' was rejected!`);
			$.PlaySoundEvent('Player.DenyWeaponSelection');
		} else {
			$.PlaySoundEvent('Player.WeaponSelectionMoveSlot');
		}
		this.fadeOutTimer();
	}

	static weaponSelected(action: WeaponSelectAction) {
		if (!this.weapons || this.weapons.length <= 1) return;
		this.updateWeaponsInfo();
		this.show();
		switch (action) {
			case WeaponSelectAction.NEXT: {
				this.setIndexSelectionState(false);
				this.moveSelectorNext();
				this.selectWeapon();
				break;
			}

			case WeaponSelectAction.PREV: {
				this.setIndexSelectionState(false);
				this.moveSelectorBack();
				this.selectWeapon();
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

	static updateWeaponsInfo() {
		this.bucketedWeapons.forEach((group: SwitcherData[], i: number) => {
			group.forEach((data: SwitcherData, j: number) => {
				if (data.panel && data.panel.IsValid()) {
					data.panel.SetHasClass('weapons__bucket__entry__red', !WeaponsAPI.CanSwitchToWeapon(data.id));
				}
			});
		});
	}

	static updateWeapons() {
		$.Msg('Updating weapons...');

		this.bucketedWeapons = [];
		this.weapons = [];
		this.weapons = WeaponsAPI.GetWeapons();
		if (this.weapons === null || WeaponsAPI.GetWeaponCount() === -1) {
			$.Warning('Weapons array is invalid');
			return;
		}

		$.Msg(`${WeaponsAPI.GetWeaponCount()} weapons`);

		for (const weapon of this.weapons) {
			if (!weapon) continue;
			$.Msg(`===== WEAPON: ${weapon.name} (${weapon.classname}), SLOT ${weapon.slot}`);
			if (!this.bucketedWeapons[weapon.slot]) {
				$.Msg(`Create new bucket at index: ${weapon.slot}`);
				this.bucketedWeapons[weapon.slot] = [];
			}
			this.bucketedWeapons[weapon.slot].push(
				new SwitcherData(WeaponsAPI.GetWeaponIndexFromClass(weapon.classname), weapon)
			);
		}

		this.constructPanels();

		const curWep = WeaponsAPI.GetActiveWeaponInfo();
		if (!curWep) return;
		try {
			this.bucketedWeapons.forEach((weapons: SwitcherData[], i: number) => {
				weapons.forEach((weapon: SwitcherData, j: number) => {
					if (weapon.weapon.classname === curWep.classname) {
						this.selectedIndex[0] = i;
						this.selectedIndex[1] = j;
						throw 'Found';
					}
				});
				$.Warning('Could not find what the active weapon is in buckets!');
			});
		} catch {
			$.Msg(`Current weapon selection updated to: [${this.selectedIndex[0]}, ${this.selectedIndex[1]}]`);
		}

		this.updateWeaponsInfo();
	}

	static constructPanels() {
		$.GetContextPanel().RemoveAndDeleteChildren();

		const bucketCount = Math.max(this.bucketedWeapons.length, this.MIN_NUM_BUCKETS);
		for (let i = 0; i < bucketCount; ++i) {
			const weapons = this.bucketedWeapons[i];

			// always create a bucket (empty looking one)
			const bucketPanel = $.CreatePanel('Panel', $.GetContextPanel(), `Bucket${i}`);
			bucketPanel.AddClass('weapons__bucket');

			if (!weapons) {
				const fakeWeapon = $.CreatePanel('Panel', bucketPanel, `Bucket${i}-EMPTY`);
				fakeWeapon.AddClass('weapons__bucket__entry');
				fakeWeapon.AddClass('weapons__bucket__entry__empty');
				continue;
			}

			weapons.forEach((data: SwitcherData, weaponIndex: number) => {
				const weapon = data.weapon;
				const weaponPanel = $.CreatePanel('Panel', bucketPanel, `Bucket${i}-${weapon.classname}`);
				weaponPanel.AddClass('weapons__bucket__entry');

				if (weaponIndex !== 0) {
					weaponPanel.AddClass('weapons__bucket__entry__sub');
				}

				this.bucketedWeapons[i][weaponIndex].panel = weaponPanel;

				if (weaponIndex === 0) {
					const bucketLabel = $.CreatePanel('Label', weaponPanel, `Bucket${i}-NumLabel`, {
						text: `${i + 1}`
					});
					bucketLabel.AddClass('weapons__bucket__entry__num');
				}

				const weaponIcon = $.CreatePanel('Label', weaponPanel, `${weapon.classname}-IconLabel`);
				weaponIcon.AddClass('weapons__bucket__entry__icon-label');
				switch (weapon.classname) {
					case 'weapon_crowbar':
						weaponIcon.text = 'c';
						break;
					case 'weapon_physcannon':
						weaponIcon.text = 'm';
						break;
					case 'weapon_pistol':
						weaponIcon.text = 'd';
						break;
					case 'weapon_357':
						weaponIcon.text = 'e';
						break;
					case 'weapon_smg1':
						weaponIcon.text = 'a';
						break;
					case 'weapon_ar2':
						weaponIcon.text = 'l';
						break;
					case 'weapon_crossbow':
						weaponIcon.text = 'g';
						break;
					case 'weapon_shotgun':
						weaponIcon.text = 'b';
						break;
					case 'weapon_rpg':
						weaponIcon.text = 'i';
						break;
					case 'weapon_frag':
						weaponIcon.text = 'k';
						break;
					case 'weapon_bugbait':
						weaponIcon.text = 'j';
						break;
					default:
						weaponIcon.AddClass('weapons__bucket__entry__icon-label__unknown');
						weaponIcon.text = '?';
						break;
				}

				const weaponLabel = $.CreatePanel('Label', weaponPanel, `${weapon.classname}-Label`, {
					text: `${weapon.classname}`
				});
				weaponLabel.AddClass('weapons__bucket__entry__name');
			});
		}
	}
}
