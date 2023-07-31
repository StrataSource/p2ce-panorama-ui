class Console {
	static messageTarget = $<StaticConsoleMessageTarget>('#ConsoleMessageTarget')!;

	static onMoveDragStart(_source: unknown, info: DragEventInfo) {
		info.displayPanel = $.GetContextPanel();
		info.removePositionBeforeDrop = false;
	}

	static toggle() {
		$.DispatchEvent('ToggleConsole');
	}

	static onNewMessages() {
		this.messageTarget.ScrollToBottom();
	}

	static {
		$.RegisterEventHandler('DragStart', $('#MoveDragArea')!, Console.onMoveDragStart);
		$.RegisterEventHandler('NewConsoleMessages', 'ConsoleMessageTarget', Console.onNewMessages.bind(this));
	}
}
