
class WeaponAPITests {
	
	static PlayerHurt(evName, data) {
		$.Msg(WeaponAPI.GetWeapons());
		$.Msg(WeaponAPI.GetActiveWeaponInfo());
		$.Msg('Active: ' + WeaponAPI.GetActiveWeapon());
		WeaponAPI.SwitchTo(WeaponAPI.GetWeaponIndex('weapon_pistol'));
		if (WeaponAPI.HasWeapon('weapon_pistol')) {
			$.Msg('WTF this guy strapped!');
			$.Msg(WeaponAPI.GetWeaponInfo(WeaponAPI.GetWeaponIndex('weapon_pistol')));
		}
	}

	static Select(action) {
		if (action == WeaponSelectAction.NEXT) {
			$.Msg('NEXT');
		}
		else if (action == WeaponSelectAction.PREV) {
			$.Msg('PREV');
		}
		else if (action == WeaponSelectAction.SHOW) {
			$.Msg('SHOW');
		}
		else if (action == WeaponSelectAction.HIDE) {
			$.Msg('HIDE');
		}
	}

	static Test(evName, data) {
		$.Msg(data);
	}

	static StateChange(mode, index) {
		if (mode == WeaponStateMode.PICKUP ) {
			$.Msg('Picked up ' + index);
		}
		else if (mode == WeaponStateMode.SWITCH ) {
			$.Msg('Switch to ' + index);
		}
	}

	static {
		GameInterfaceAPI.RegisterGameEventHandler('player_hurt', WeaponAPITests.PlayerHurt);
		GameInterfaceAPI.RegisterGameEventHandler('weaponhud_selection', WeaponAPITests.Test);
		$.RegisterForUnhandledEvent('WeaponSelect', WeaponAPITests.Select);
		$.RegisterForUnhandledEvent('WeaponStateChange', WeaponAPITests.StateChange);
	}
}
