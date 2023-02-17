
class GameEventTests {
	
	static PlayerHurt(evName, data) {
		$.Msg('Player hurt by ' + data.attacker + ' now has ' + data.health + ' health');
	}

	static PlayerSpawn(evName, data) {
		$.Msg('Player ' + data.userid + ' spawned');
	}

	static EntityKilled(evName, data) {
		$.Msg('Entity ' + data.entindex_killed + ' killed by ' + data.entindex_attacker);
	}

	static Dummy(evName, data) {
		throw 'THIS CODE SHOULD NOT BE HIT';
	}

	static {
		GameInterfaceAPI.RegisterGameEventHandler('entity_killed', GameEventTests.EntityKilled);
		GameInterfaceAPI.RegisterGameEventHandler('player_spawn', GameEventTests.PlayerSpawn);
		GameInterfaceAPI.RegisterGameEventHandler('player_hurt', GameEventTests.PlayerHurt);

		const bad = GameInterfaceAPI.RegisterGameEventHandler('player_spawn', GameEventTests.Dummy);
		GameInterfaceAPI.UnregisterGameEventHandler(bad);
	}
}
