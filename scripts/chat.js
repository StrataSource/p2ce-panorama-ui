"use strict";

const Chat = (function () {
	let isContentPanelOpen = false;
	const chatPanel = $("#PartyChat");
	const originalParent = chatPanel.GetParent(); // Our parent panel at the time of creation. Used when moving chat between accept button popup and main menu.

	function _Init() {
		const elInput = $("#ChatInput");
		elInput.SetPanelEvent("oninputsubmit", Chat.ChatTextSubmitted);

		const elOpenChat = $.GetContextPanel().FindChildInLayoutFile("ChatContainer");
		elOpenChat.SetPanelEvent("onactivate", function () {
			_OpenChat();
		});

		const elCloseChat = $.GetContextPanel().FindChildInLayoutFile("ChatCloseButton");
		elCloseChat.SetPanelEvent("onactivate", function () {
			_Close();
		});
	}

	function _OpenChat() {
		const elChatContainer = $("#ChatContainer");

		if (!elChatContainer.BHasClass("chat-open")) {
			elChatContainer.RemoveClass("closed-minimized");
			elChatContainer.AddClass("chat-open");
			$("#ChatInput").SetFocus();
			$("#ChatInput").activationenabled = true;

			$.Schedule(0.1, _ScrollToBottom);
		}
	}

	function _Close() {
		const elChatContainer = $("#ChatContainer");
		if (elChatContainer.BHasClass("chat-open")) {
			elChatContainer.RemoveClass("chat-open");
			elChatContainer.SetFocus();
			$("#ChatInput").activationenabled = false;
			$.Schedule(0.1, _ScrollToBottom);

			_SetClosedHeight();
			return true; // swallow escape key if we closed the chat
		}
		return false;
	}

	function _SetClosedHeight() {
		const elChatContainer = $("#ChatContainer");
		if (!elChatContainer.BHasClass("chat-open")) {
			elChatContainer.SetHasClass("closed-minimized", isContentPanelOpen);
			$.Schedule(0.1, _ScrollToBottom);
		}
	}

	function _ChatTextSubmitted() {
		$.GetContextPanel().SubmitChatText();
		$("#ChatInput").text = "";
	}

	function _OnNewChatEntry() {
		$.Schedule(0.1, _ScrollToBottom);
	}

	function _ScrollToBottom() {
		$("#ChatLinesContainer").ScrollToBottom();
	}

	function _SessionUpdate(status) {
		const elChat = $.GetContextPanel().FindChildInLayoutFile("ChatPanelContainer");

		if (status === "closed") _ClearChatMessages();

		if (!LobbyAPI.IsSessionActive()) elChat.AddClass("hidden");
		else {
			const numPlayersActuallyInParty = PartyListAPI.GetCount();
			const networkSetting = PartyListAPI.GetPartySessionSetting("system/network");

			elChat.SetHasClass("hidden", networkSetting !== "LIVE");

			if (networkSetting !== "LIVE") _Close();

			const elPlaceholder = $.GetContextPanel().FindChildInLayoutFile("PlaceholderText");

			if (numPlayersActuallyInParty > 1) elPlaceholder.text = $.Localize("#party_chat_placeholder");
			else elPlaceholder.text = $.Localize("#party_chat_placeholder_empty_lobby");
		}
	}

	function _ClearChatMessages() {
		const elMessagesContainer = $("#ChatLinesContainer");
		elMessagesContainer.RemoveAndDeleteChildren();
	}

	const _ClipPanelToNotOverlapSideBar = function (noClip) {
		const panelToClip = $.GetContextPanel();
		if (!panelToClip || panelToClip.BHasClass("hidden")) return;

		// Chat has its parent reset when we have the accept match button up.
		// We check to make sure its in under the correct parent for the clip styles to apply
		if ($.GetContextPanel().GetParent().id !== "MainMenuFriendsAndParty") return;

		const panelToClipWidth = panelToClip.actuallayoutwidth;
		const friendsListWidthWhenExpanded = panelToClip
			.GetParent()
			.FindChildInLayoutFile("mainmenu-sidebar__blur-target").contentwidth;

		const sideBarWidth = noClip ? 0 : friendsListWidthWhenExpanded;
		const widthDiff = panelToClipWidth - sideBarWidth;
		const clipPercent = (panelToClipWidth <= 0 || widthDiff <= 0 ? 1 : widthDiff / panelToClipWidth) * 100;

		if (clipPercent) panelToClip.style.clip = "rect( 0%, " + clipPercent + "%, 100%, 0% );";
	};

	const _OnHideContentPanel = function () {
		isContentPanelOpen = false;
		_SetClosedHeight();
	};

	const _OnShowContentPanel = function () {
		isContentPanelOpen = true;
		_SetClosedHeight();
	};

	const _OnShowAcceptPopup = function (popup) {
		chatPanel.SetParent(popup.FindChild("id-accept-match"));

		const elChatContainer = $("#ChatContainer");

		// Focus does not transition to a popup so we set it when the chat is open.
		// This allows you to type even after through the reparenting without having
		// to click to get focus of the text field again.
		if (elChatContainer.BHasClass("chat-open")) {
			$("#ChatInput").SetFocus();
			$("#ChatInput").activationenabled = true;
		}
	};

	const _OnCloseAcceptPopup = function () {
		chatPanel.SetParent(originalParent);
		const elPreviousPeer = originalParent.FindChild("JsMainMenuSidebar");
		originalParent.MoveChildAfter(chatPanel, elPreviousPeer);

		// When we reparent chat to the friends list the y pos is incorrect due to parenting.
		// We override it here to be at the top.
		chatPanel.style.y = "0px";
		_Init();
	};

	return {
		Init: _Init,
		ChatTextSubmitted: _ChatTextSubmitted,
		SessionUpdate: _SessionUpdate,
		NewChatEntry: _OnNewChatEntry,
		OnSideBarHover: _ClipPanelToNotOverlapSideBar,
		OnHideContentPanel: _OnHideContentPanel,
		OnShowContentPanel: _OnShowContentPanel,
		Close: _Close,
		OnShowAcceptPopup: _OnShowAcceptPopup,
		OnCloseAcceptPopup: _OnCloseAcceptPopup,
	};
})();

// Entry point called on create
(function () {
	Chat.Init();
	$.RegisterForUnhandledEvent("PanoramaComponent_Lobby_MatchmakingSessionUpdate", Chat.SessionUpdate);
	$.RegisterForUnhandledEvent("OnNewChatEntry", Chat.NewChatEntry);
	$.RegisterEventHandler("Cancelled", $.GetContextPanel(), Chat.Close);
	$.RegisterForUnhandledEvent("SidebarIsCollapsed", Chat.OnSideBarHover);
	$.RegisterForUnhandledEvent("HideContentPanel", Chat.OnHideContentPanel);
	$.RegisterForUnhandledEvent("ShowContentPanel", Chat.OnShowContentPanel);
	$.RegisterForUnhandledEvent("ShowAcceptPopup", Chat.OnShowAcceptPopup);
	$.RegisterForUnhandledEvent("CloseAcceptPopup", Chat.OnCloseAcceptPopup);
})();
