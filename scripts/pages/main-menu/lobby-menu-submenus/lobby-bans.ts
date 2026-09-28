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
                    LobbyBans.onLoad();
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
    static banList: BanEntry[] = [];

    static onLoad() {
        for (const entry of this.banList) {
            entry.destruct();
        }

        this.banList = P2CELobbyAPI.GetBannedPlayers().map(steamID => new BanEntry(steamID));
    }
}