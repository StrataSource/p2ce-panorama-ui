'use strict';

class BanEntry {
    panel: Panel;
    avatar: AvatarImage;
    avatarBtn: Button;
    unbanButton: Button;

    steamID: steamID;
    username: string;

    constructor(userSteamID: steamID) {
        this.steamID = userSteamID;
        this.username = FriendsAPI.GetNameForXUID(userSteamID);

        this.panel = $.CreatePanel('Panel', LobbyBans.banListPanel, `BanEntry_${userSteamID}`);
        this.panel.LoadLayoutSnippet('BanEntry');
        this.panel.SetDialogVariable('username', this.username);

        this.avatar = this.panel.FindChildTraverse('PlayerAvatar')!;
        this.avatar.steamid = this.steamID;

        this.avatarBtn = this.panel.FindChildTraverse('SteamProfileBtn')!;
        this.avatarBtn.SetPanelEvent('onactivate', () => {
            SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/profiles/${this.steamID}`);
        });

        this.unbanButton = this.panel.FindChildTraverse('UnbanBtn')!;
        this.unbanButton.SetPanelEvent('onactivate', () => {
            $.PlaySoundEvent('UIPanorama.P2CE.MenuError');
            UiToolkitAPI.ShowGenericPopupYesNo(
                '[HC] Unban Player?',
                '[HC] Are you sure you want to remove this player from the ban list?' + `\nUsername: ${this.username}\nSteamID: ${this.steamID}`,
                'warning-popup',
                () => {
                    P2CELobbyAPI.UnBanPlayer(this.steamID);
                    LobbyBans.reload();
                },
                () => {}
            );
        });
    }

	destruct() {
		this.panel.RemoveAndDeleteChildren();
		this.panel.DeleteAsync(0);
	}

}

class LobbyBans {

    static banListPanel = $<Panel>('#LobbyBans')!;
    static noBansPanel = $<Panel>('#NoBansEntry')!;
    static unbanAllButton = $<Button>('#UnbanAllBtn')!;

    static banList: BanEntry[] = [];

    static onLoad() {
        this.unbanAllButton.SetPanelEvent('onactivate', () => {
            $.PlaySoundEvent('UIPanorama.P2CE.MenuError');
            UiToolkitAPI.ShowGenericPopupYesNo(
                '[HC] Unban All Players?',
                '[HC] Are you sure you want to remove all players from the ban list?',
                'warning-popup',
                () => {
                    for (const entry of this.banList) {
                        P2CELobbyAPI.UnBanPlayer(entry.steamID);
                    }

                    this.reload();
                },
                () => {}
            );
        });

        // Capture any bans.
        $.RegisterForUnhandledEvent('PanoramaComponent_P2CELobby_PlayerLeft', (playerSteamID: steamID) => {
            $.Msg("MURDERED!");
            this.reload();
        });

        this.reload();
    }

    static reload() {
        for (const entry of this.banList) {
            entry.destruct();
        }

        this.unbanAllButton.visible = true;
        this.noBansPanel.visible = false;
        const curBanList = P2CELobbyAPI.GetBannedPlayers();
        if (curBanList.length === 0) {
            this.unbanAllButton.visible = false;
            this.noBansPanel.visible = true;
            return;
        }

        this.banList = curBanList.map(steamID => new BanEntry(steamID));
    }
}