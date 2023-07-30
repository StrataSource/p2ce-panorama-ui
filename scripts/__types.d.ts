/**
 * @author Koerismo
 * @description Describes the Panorama APIs with full typing. Some types defined in this file
 * may be out of date or innacurate. If you find something that needs to be fixed, report it!
*/

/* ========================    PRIMITIVES   ======================== */

interface PanelTagNameMap {
	'Panel': Panel,
	'Button': Button,
	'TextEntry': TextEntry,
	'ToggleButton': ToggleButton,
	'Frame': Frame,
	'Image': Image,
	'Label': Label,
	'Movie': Movie
	'ProgressBar': ProgressBar,
	'ResizeDragKnob': ResizeDragKnob,
	'ModelPanel': ModelPanel,
	'UICanvas': UICanvas,
	'ChaosBackbufferImagePanel': ChaosBackbufferImagePanel,
	'ChaosLoadingScreen': ChaosBackbufferImagePanel,
	'ChaosMainMenu': ChaosMainMenu,
	'ChaosSettingsSlider': ChaosSettingsSlider,
}

/** Defines a panel event source. */
declare type PanelEventSource = PanelEventSourceEnum[keyof PanelEventSourceEnum];
interface PanelEventSourceEnum {
	PROGRAM:  0,
	GAMEPAD:  1,
	KEYBOARD: 2,
	MOUSE:    3,
	INVALID:  4,
}

/** Defines the current game state. */
declare type GameUIState = GameUIStateEnum[keyof GameUIStateEnum];
interface GameUIStateEnum {
	INVALID:       0,
	LOADINGSCREEN: 1,
	INGAME:        2,
	MAINMENU:      3,
	PAUSEMENU:     4,
	INTROMOVIE:    5
}

declare type float = number;
declare type double = number;

declare type uint16 = number;
declare type uint32 = number;
declare type uint64 = number;

declare type int16 = number;
declare type int32 = number;
declare type int64 = number;

/** A duration in seconds. */
declare type duration = number;

/** Represents a unique id return. */
declare type uuid = int32;

/** Represents a keyframes animation return. */
declare type Keyframes = unknown;

/** Represents a console message target. */
declare type StaticConsoleMessageTarget = Panel;

/** Generic panel styling properties. UNFINISHED! */
declare interface Style {
	// Foreground
	color: string;
	font: string;
	fontFamily: string;
	fontSize: number;
	fontStyle: 'normal'|'italic';
	fontWeight: 'light'|'thin'|'normal'|'medium'|'bold'|'black';
	letterSpacing: string;
	lineHeight: string;
	textAlign: 'left'|'center'|'right';
	textDecoration: 'none'|'underline'|'line-through';
	textOverflow: 'ellipses'|'clip'|'shrink'|'noclip';
	textShadow: string;
	textShadowFast: string;
	textTransform: string;
	whiteSpace: 'normal'|'nowrap';

	// Background
	backgroundColor: string;
	backgroundImage: string;
	backgroundImgOpacity: number;
	backgroundPosition: string;
	backgroundRepeat: string;
	backgroundSize: string;

	// Alignment
	align: string;
	verticalAlign: 'bottom'|'center'|'top';
	horizontalAlign: 'left'|'center'|'right';

	// Layout
	position: string;
	transform: string;
	transformOrigin: string;
	overflow: string;
	height: string;
	width: string;
	flowChildren: 'none'|'left'|'right'|'up'|'down';
	maxHeight: string;
	maxWidth: string;
	minHeight: string;
	minWidth: string;

	// Transition
	transition: string;
	transitionDelay: string;
	transitionDuration: string;
	transitionProperty: string;
	transitionTimingFunction: string;

	// UI
	uiScale: string;
	uiScaleX: string;
	uiScaleY: string;
	uiScaleZ: string;

	// Animation
	animation: string;
	animationDelay: string;
	animationDirection: string;
	animationDuration: string;
	animationFillMode: string;
	animationIterationCount: string;
	animationName: string;
	animationTimingFunction: string;

	// Border
	border: string;
	borderBottom: string;
	borderBottomColor: string;
	borderBottomLeftRadius: string;
	borderBottomRightRadius: string;
	borderBottomStyle: string;
	borderBottomWidth: string;
	borderColor: string;
	borderLeft: string;
	borderLeftColor: string;
	borderLeftStyle: string;
	borderLeftWidth: string;
	borderRadius: string;
	borderRight: string;
	borderRightColor: string;
	borderRightStyle: string;
	borderRightWidth: string;
	borderStyle: string;
	borderTop: string;
	borderTopColor: string;
	borderTopLeftRadius: string;
	borderTopRightRadius: string;
	borderTopStyle: string;
	borderTopWidth: string;
	borderWidth: string;

	// Margin
	margin: string;
	marginLeft: string;
	marginRight: string;
	marginTop: string;
	marginBottom: string;

	// Padding
	padding: string;
	paddingBottom: string;
	paddingLeft: string;
	paddingRight: string;
	paddingTop: string;

	// Effects
	blur: string;
	boxShadow: string;
	brightness: string;
	clip: string;
	contrast: string;
	washColor: string;
	washColorFast: string;
	hueRotation: string;
	imgShadow: string;
	saturation: string;
	sound: string;
	soundOut: string;
	soundTrans: string;
	textureSampling: string;

	// Perspective
	perspective: string;
	perspectiveOrigin: string;
	preTransformRotate2d: string;
	preTransformScale2d: string;

	// Opacity
	opacity: string;
	opacityMask: string;
	opacityMaskScrollDown: string;
	opacityMaskScrollUp: string;
	opacityMaskScrollUpDown: string;

	// Visibility
	visibility: 'visible'|'collapse';
	zIndex: number;
}

/* ======================== PANEL SELECTOR  ======================== */

type QueryOutput<E, T> = T extends `.${string}` ? E[] : E;

/** @description Selects an element. */
declare function $<E extends Panel, T extends string = string>(selector: T): QueryOutput<E, T>|null;

declare namespace $ {

	namespace persistentStorage {
		/** @readonly @description $.persistentStorage.length.  Returns an integer representing the number of data items stored in the Storage object. */
		var length: int32;

		/** @description $.persistentStorage.clear().  When invoked, will empty all keys out of the storage. */
		function clear(): void;

		/** @description $.persistentStorage.key(n).  When passed a number n, this method will return the name of the nth key in the storage. */
		function key(n: int32): string|null;

		/** @description $.persistentStorage.getItem(keyName).  When passed a key name, will return that key's value.
		 * @example $.persistentStorage.getItem('settings.mainMenuMovie');
		 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/pages/main-menu/main-menu.js#L241)
		*/
		function getItem<T extends string|number|boolean>(keyName: string): T|null;

		/** @description $.persistentStorage.setItem(keyName, keyValue).  When passed a key name and value, will add that key to the storage, or update that key's value if it already exists.
		 * @example $.persistentStorage.setItem('dontShowAgain.' + key, true);
		 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/modals/popups/dont-show-again.js#L8)
		*/
		function setItem(keyName: string, keyValue: string|number|boolean): void;
	}

	/** @description Make a web request.
	 * @example $.AsyncWebRequest(DATA_URL, {
	 *  type: 'GET',
	 * 	complete: (data) =>
	 * 	data.statusText === 'success' ? resolve(data.responseText) : reject(data.statusText)
	 * });
	 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/pages/learn.js#L259)
	*/
	function AsyncWebRequest(url: string, options?: {
		// https://fetch.spec.whatwg.org/#methods
		type: 'DELETE'|'GET'|'HEAD'|'OPTIONS'|'POST'|'PUT',
		complete: (data: {
			responseText: string,
			statusText: string,
		}) => void,
	}): void;

	/** @description Cancel a scheduled function.
	 * @example $.CancelScheduled(ConsoleNotify.scheduleOpacity);
	 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/hud/console-notify.js#L8)
	*/
	function CancelScheduled(event: number): void;

	/** @description Create a new panel.
	 * @example $.CreatePanel('Split', wrapper, '', { class: 'split--hud split--latest' });
	 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/hud/comparisons.js#L107)
	*/
	function CreatePanel<T extends keyof PanelTagNameMap>(type: T, parent: Panel, id: string, properties?: Object): PanelTagNameMap[T];
	function CreatePanel(type: string, parent: Panel, id: string, properties?: Object): Panel;

	/** @description Call during JS startup code to check if script is being reloaded */
	function DbgIsReloadingScript(...args: any[]): void;

	/** @description Define an event.
	 *  @param event The event name.
	 *  @param argscount The number of arguments that this event takes.
	 *  @param argsdesc An optional description for the event arguments.
	 *  @param desc An option description for the event.
	 *  @example $.DefineEvent( eventName, NumArguments, [optional] ArgumentsDescription, [optional] Description )
	 *  @example $.DefineEvent('SettingsNavigateToPanel', 2, 'category, settingPanel', 'Navigates to a setting by panel handle');
	 *  @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/util/event-definition.js#L6)
	*/
	function DefineEvent(event: string, argscount: number, argsdesc?: string, desc?: string): void;

	/** @description Appears to be identical to $.DefineEvent(...). This function is not used anywhere in Momentum UI.
	 *  @param event The event name.
	 *  @param argscount The number of arguments that this event takes.
	 *  @param argsdesc An optional description for the event arguments.
	 *  @param desc An option description for the event.
	 *  @example $.DefinePanelEvent( eventName, NumArguments, [optional] ArgumentsDescription, [optional] Description )
	 *  @example $.DefinePanelEvent('SettingsNavigateToPanel', 2, 'category, settingPanel', 'Navigates to a setting by panel handle');
	 *  @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/util/event-definition.js#L7)
	*/
	function DefinePanelEvent(event: string, argscount: number, argsdesc?: string, desc?: string): void;

	/** @description Dispatch an event.
	 *  @example $.DispatchEvent('SettingsNavigateToPanel', matches.tabID, matches.panel);
	 *  @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/pages/settings/search.js#L262)
	*/
	function DispatchEvent(event: string, ...args: any[]): void;

	/** @description Dispatch an event to occur later.
	 *  @todo There don't appear to be any uses of this in Momentum UI. This needs to be documented!
	*/
	function DispatchEventAsync(...args: any[]): void;

	/** @description Call a function on each given item. Functionally identical to (...).forEach(...) */
	function Each<T>(items: T[], callback: (item: T, index: number) => void): void;

	/** @description Find an element.
	 *  @todo There don't appear to be any uses of this in Momentum UI. This needs to be documented!
	*/
	function FindChildInContext(...args: any[]): Panel|undefined;

	/** @description Gets the root panel of the current Javascript context.
	 *  @example $.GetContextPanel().color = color;
	 *  @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/components/color-display.js#L17)
	*/
	function GetContextPanel(): Panel;

	/**
	 * @description $.HTMLEscape(str, truncate=false).  Converts str, which must be 2048 utf-8 bytes or shorter, into an HTML-safe version.  If truncate=true, too long strings will be truncated instead of throwing an exception
	 * @todo There don't appear to be any uses of this in Momentum UI. This needs to be documented!
	*/
	function HTMLEscape(str: string, truncate?: boolean): string;

	/** @description Get the current language */
	function Language(): string;

	/** @description Load a named key values file and return as JS object.
	 * @param url The path to the file, including the extension, relative to the content folder root.
	 * @example $.LoadKeyValuesFile('panorama/data/changelog.vdf');
	 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/pages/drawer/about.js#L76)
	*/
	function LoadKeyValuesFile(url: string): Object;

	/** @description Load a named key values file and return as JS object.
	 * @param url The path to the file, including the extension, relative to the content folder root.
	*/
	function LoadKeyValues3File(url: string): Object;

	/** @description Localizes a string.
	 * @example $.Localize('#HudStatus_Spawn');
	 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/hud/status.js#L47)
	*/
	function Localize(str: string): string|null;

	/** @description Localize a string, but return empty string if the localization token is not found */
	function LocalizeSafe(str: string): string;

	/** @description Log a message */
	function Msg(...messages: any[]): void;

	/** @description $.PlaySoundEvent(str).  Plays the named sound event. */
	function PlaySoundEvent(...args: any[]): void;

	/** @description Register an event handler
	 * @example $.RegisterEventHandler('OnNewChatEntry', $.GetContextPanel(), this.onNewChatEntry.bind(this));
	 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/components/chat.js#L8)
	 *
	*/
	function RegisterEventHandler(event: string, context: Panel, callback: Function): void;

	/** @description Register a handler for an event that is not otherwise handled
	 * @example $.RegisterForUnhandledEvent('OnMomentumTimerStateChange', this.onTimerEvent.bind(this));
	 * @see [Example](https://github.com/momentum-mod/panorama/blob/721f39fe40bad57cd93943278d3a3c857e9ae9d7/scripts/hud/comparisons.js#L18)
	*/
	function RegisterForUnhandledEvent(event: string, callback: Function): void;

	/** @description Register a key binding */
	function RegisterKeyBind(panel: Panel, key: string, event: Function|string): void;

	/** @description $.persistentStorage.removeItem(keyName).  When passed a key name, will remove that key from the storage. */
	function removeItem(keyName: string): void;

	/** @description Schedule a function to be called later
	 * @returns A unique event identifier.
	*/
	function Schedule(time: duration, callback: Function): number;

	/** @description $.StopSoundEvent(guid, [fadetime]). Stops the sound event. guid was returned from a previous call to PlaySoundEvent. fadetime is optional. */
	function StopSoundEvent(guid: any, fadetime?: number): void;

	/** @description Remove an event handler */
	function UnregisterEventHandler(...args: any[]): void;

	/** @description Remove an unhandled event handler */
	function UnregisterForUnhandledEvent(...args: any[]): void;

	/** @description $.UrlDecode(str).  Decodes str, which must be 2048 utf-8 bytes or shorter, from URL-encoded form. */
	function UrlDecode(...args: any[]): void;

	/** @description $.UrlEncode(str).  Encodes str, which must be 2048 utf-8 bytes or shorter, into URL-encoded form. */
	function UrlEncode(...args: any[]): void;

	/** @description Log a warning */
	function Warning(...args: any[]): void;

}

/* ======================== PANEL ELEMENTS  ======================== */

declare interface Panel {
	activationenabled: boolean;

	/** @readonly */
	actuallayoutheight: float;

	/** @readonly */
	actuallayoutwidth: float;

	/** @readonly */
	actualuiscale_x: float;

	/** @readonly */
	actualuiscale_y: float;

	/** @readonly */
	actualxoffset: float;

	/** @readonly */
	actualyoffset: float;

	checked: boolean;

	/** @readonly */
	contentheight: float;

	/** @readonly */
	contentwidth: float;

	defaultfocus: string;

	/** @readonly */
	desiredlayoutheight: float;

	/** @readonly */
	desiredlayoutwidth: float;

	enabled: boolean;

	hittest: boolean;

	hittestchildren: boolean;

	/** @readonly */
	id: string;

	inputnamespace: string;

	/** @readonly */
	layoutfile: string;

	/** @readonly */
	paneltype: string;

	rememberchildfocus: boolean;

	/** @readonly */
	scrolloffset_x: float;

	/** @readonly */
	scrolloffset_y: float;

	selectionpos_x: float;

	selectionpos_y: float;

	/** @readonly */
	style: Style;

	tabindex: float;

	visible: boolean;

	AcceptsFocus(): boolean;

	AcceptsInput(): boolean;

	AddClass(classname: string): void;

	/** @todo Document this. */
	ApplyStyles(arg0: boolean): void;

	/** @todo Document this. */
	BAscendantHasClass(arg0: string): boolean;

	CanSeeInParentScroll(): boolean;

	Children(): Panel[];

	ClearPanelEvent(event: string): void;

	/** @todo Document this. */
	ClearPropertyFromCode(arg0: unknown): void;

	CreateChildren(elements: string): boolean;

	/** @todo Document this. */
	CreateCopyOfCSSKeyframes(animation: string): Keyframes;

	Data(...args: any[]): void;

	DeleteAsync(delay: float): void;

	DeleteKeyframes(animation: Keyframes): void;

	/** @description Searches this element's direct children and returns a child with the specified id. */
	FindChild(id: string): Panel|null;

	FindChildInLayoutFile(id: string): Panel|null;

	FindChildrenWithClassTraverse(classname: string): Panel[];

	FindChildTraverse(id: string): Panel|null;

	GetAttributeInt(attribute: string, fallback: int32): int32;

	GetAttributeString(attribute: string, fallback: string): string;

	GetAttributeUInt32(attribute: string, fallback: uint32): uint32;

	GetChild(index: int32): Panel|null;

	GetChildCount(): int32;

	GetChildIndex(child: Panel): int32;

	GetFirstChild(): Panel|null;

	GetLastChild(): Panel|null;

	GetLayoutFileDefine(def: string): unknown;

	GetParent(): Panel|null;

	GetPositionWithinWindow(): unknown;

	HasClass(classname: string): boolean;

	HasDescendantKeyFocus(): boolean;

	HasHoverStyle(): boolean;

	HasKeyFocus(): boolean;

	IsDraggable(): boolean;

	IsReadyForDisplay(): boolean;

	IsSelected(): boolean;

	IsSizeValid(): boolean;

	IsTransparent(): boolean;

	/** @todo Validate these arguments. */
	LoadLayout(url: string, override: boolean, partial: boolean): boolean;

	/** @todo Validate these arguments. */
	LoadLayoutAsync(url: string, override: boolean, partial: boolean): void;

	/** @todo Validate these arguments. */
	LoadLayoutFromString(layout: string, override: boolean, partial: boolean): void;

	/** @todo Validate these arguments. */
	LoadLayoutFromStringAsync(layout: string, override: boolean, partial: boolean): void;

	/** @todo Validate these arguments. */
	LoadLayoutSnippet(snippet: string): boolean;

	MoveChildAfter(arg0: unknown, arg1: unknown): void;

	MoveChildBefore(arg0: unknown, arg1: unknown): void;

	/** @description Registers this panel to receive ready/unready events.
	 * @param enable Should this panel receive ready/unready events?
	 */
	RegisterForReadyEvents(enable: boolean): void;

	RemoveAndDeleteChildren(): void;

	RemoveClass(classname: string): void;

	ScrollParentToFitWhenFocused(): boolean;

	ScrollParentToMakePanelFit(arg0: number, arg1: boolean): void;

	ScrollToBottom(): void;

	ScrollToFitRegion(arg0: float, arg1: float, arg2: float, arg3: float, arg4: unknown, arg5: boolean, arg6: boolean): void;

	ScrollToLeftEdge(): void;

	ScrollToRightEdge(): void;

	ScrollToTop(): void;

	SetAcceptsFocus(istrue: boolean): void;

	SetAttributeInt(attribute: string, value: int32): void;

	SetAttributeString(attribute: string, value: string): void;

	SetAttributeUInt32(attribute: string, value: uint32): void;

	SetDialogVariable(arg0: string, arg1: string): void;

	SetDialogVariableFloat(arg0: string, arg1: float): void;

	SetDialogVariableInt(arg0: string, arg1: int32): void;

	SetDialogVariableTime(arg0: string, arg1: int64): void;

	SetDisableFocusOnMouseDown(istrue: boolean): void;

	SetDraggable(istrue: boolean): void;

	SetFocus(): boolean;

	SetHasClass(classname: string, hasclass: boolean): void;

	SetInputNamespace(arg0: string): void;

	/** @description Sets an event trigger for this panel.
	 * @example latestUpdateImage.SetPanelEvent('onactivate', () => SteamOverlayAPI.OpenURLModal(item.link));
	 * @see [Example](https://github.com/momentum-mod/panorama/blob/568f2d8de1303b86592a9a8602efd416f6a2f5bf/scripts/pages/main-menu/news.js#L57)
	*/
	SetPanelEvent(event: string, callback: Function): void;

	SetParent(parent: Panel): void;

	SetReadyForDisplay(arg0: boolean): void;

	SetScrollParentToFitWhenFocused(arg0: boolean): void;

	SetTopOfInputContext(arg0: boolean): void;

	/** @todo Verify this typing! */
	SortChildrenOnAttribute(attribute: string, reverse: boolean): void;

	SwitchClass(oldclass: string, newclass: string): void;

	ToggleClass(classname: string): void;

	TriggerClass(classname: string): void;

	UpdateCurrentAnimationKeyframes(animation: Keyframes): void;

	UpdateFocusInContext(): boolean;
}

declare interface Button extends Panel {
}

/** @description An interactive text input.
 * @todo These types are incomplete and unverified!
 * @example <TextEntry
 *     id="MaxPlayers"
 *     textmode="numeric"
 *     placeholder="32"
 *     maxchars="3"
 *     ontextentrychange="LobbySettings.onChanged()" />
*/
declare interface TextEntry extends Panel {
	text: string;

	ClearSelection(): void;

	GetMaxCharCount(): uint32;

	RaiseChangeEvents(arg0: boolean): void;

	SetCursorOffset(offset: int32): void;

	SetMaxChars(max: uint32): void;

	Submit(): boolean;
}

declare interface ToggleButton extends Panel {
	text: string;

	SetSelected(arg0: boolean): void;
}

declare interface Frame extends Panel {
	/** @description Sets the Frame content to the specified snippet. */
	SetSnippet(snippet: string): void;

	/** @description Sets the Frame content to the specified layout file url. */
	SetSource(source: string): void;
}

declare interface Image extends Panel {
	SetImage(arg0: string): void;

	SetScaling(arg0: string): void;
}

declare interface Label extends Panel {
	text: string;
}

declare interface Movie extends Panel {
	IsAdjustingVolume(): boolean;

	Pause(): void;

	Play(): void;

	SetControls(arg0: string): void;

	SetMovie(path: string): void;

	SetPlaybackVolume(volume: float): void;

	SetRepeat(istrue: boolean): void;

	SetSound(path: string): void;

	SetTitle(name: string): void;

	Stop(): void;
}

declare interface ProgressBar extends Panel {
	max: float;

	min: float;

	value: float;
}

declare interface ResizeDragKnob extends Panel {
	horizontalDrag: boolean;

	/** @readonly */
	target: unknown;

	verticalDrag: boolean;
}

/** @description Renders a 3d model in the UI.
 * @example <ModelPanel
 *     src="models/npcs/turret/turret.mdl"
 *     cubemap="cubemaps/cubemap_menu_model_bg.hdr"
 *     antialias="true"
 *     mouse_rotate="false" />
*/
declare interface ModelPanel extends Panel {
	/** @description The model that this ModelPanel should display, relative to `/` */
	src: string;

	/** @description The cubemap that this ModelPanel should display, excluding the `.vtf` extension. This path is relative to `materials/`. */
	cubemap: string;

	/** @description Whether this ModelView should use antialiasing. */
	antialias: boolean;

	/** @description Whether the mouse can be dragged over this ModelView to rotate the model.
	 * This property can only be set through XML. To modify it, use the `SetMouseRotationAllowed` method.
	 * @readonly
	*/
	mouse_rotate: boolean;

	AddParticleSystem(arg0: string, arg1: string, arg2: boolean): void;

	LookAt(x: float, y: float, z: float): void;

	LookAtModel(): void;

	SetCameraAngles(x: float, y: float, z: float): void;

	SetCameraFOV(fov: float): void;

	SetCameraOffset(x: float, y: float, z: float): void;

	SetCameraPosition(x: float, y: float, z: float): void;

	/** @description Sets the color of a directional light as floats.
	 * @param {int32} light The ID of the light. (0-4)
	*/
	SetDirectionalLightColor(light: int32, r: float, g: float, b: float): void;

	/** @description Sets the direction of a directional light.
	 * @param {int32} light The ID of the light. (0-4)
	*/
	SetDirectionalLightDirection(light: int32, x: float, y: float, z: float): void;

	SetLightAmbient(r: float, g: float, b: float): void;

	SetModelBodygroup(arg0: int32, arg1: int32): void;

	SetModelColor(arg0: unknown): void;

	SetModelRotation(x: float, y: float, z: float): void;

	SetModelRotationAcceleration(x: float, y: float, z: float): void;

	SetModelRotationBoundsEnabled(x: boolean, y: boolean, z: boolean): void;

	SetModelRotationBoundsX(min: number, max: number): void;

	SetModelRotationBoundsY(min: number, max: number): void;

	SetModelRotationBoundsZ(min: number, max: number): void;

	SetModelRotationSpeed(x: float, y: float, z: float): void;

	SetModelRotationSpeedTarget(x: float, y: float, z: float): void;

	SetModelRotationTarget(x: float, y: float, z: float): void;

	SetMouseRotationAllowed(allow: boolean): void;

	SetMouseXRotationScale(x: number, y: number, z: number): void;

	SetMouseYRotationScale(x: number, y: number, z: number): void;

	SetParticleSystemOffsetAngles(x: float, y: float, z: float): void;

	SetParticleSystemOffsetPosition(x: float, y: float, z: float): void;
}

/** @description Renders 2d shapes in the UI.
 * @todo These types are incomplete and unverified!
*/
declare interface UICanvas extends Panel {
	/**
	 * @param count The number of points to draw.
	 * @param coords An array of x/y coordinates.
	 * @param thickness The thickness of the line.
	 * @param color The color of the line as a string.
	 */
	DrawLinePoints(count: number, coords: number[], thickness: number, color: string): void;

	/**
	 * @param count The number of points to draw.
	 * @param coords An array of x/y coordinates.
	 * @param color The color of the line as a string.
	 */
	DrawPoly(count: number, coords: number[], color: string): void;
}

declare interface ChaosBackbufferImagePanel extends Panel {
}

declare interface ChaosLoadingScreen extends Panel {
}

declare interface ChaosMainMenu extends Panel {
	IsMultiplayer(): boolean;
}

declare interface ChaosSettingsSlider extends Panel {
	convar: string;

	max: float;

	min: float;

	value: float;

	ActualValue(): float;

	OnShow(): void;

	RestoreCVarDefault(): void;
}

/* ========================       APIS      ======================== */

declare namespace FriendsAPI {
	/** @description Gets the name of the local player */
	function GetLocalPlayerName(): string;

	/** @description Gets the name of the player with the given XUID. This will only be known by the local user if the given user is in their friends list, on the same game server, in a chat room or lobby, or in a small group with the local user */
	function GetNameForXUID(xuid: uint64): string;

}

declare namespace GameInterfaceAPI {
	function ConsoleCommand(command: string): void;

	function GetSettingBool(key: string): boolean;

	function GetSettingColor(key: string): unknown;

	function GetSettingFloat(key: string): float;

	function GetSettingInt(key: string): int32;

	function GetSettingString(key: string): string;

	/** @description Registers a callback for a specific game event type, returns an event handler ID to unregister with */
	function RegisterGameEventHandler(event_name: string, callback: Function): uuid;

	function SetSettingBool(key: string, value: boolean): void;

	function SetSettingColor(key: string, value: unknown): void;

	function SetSettingFloat(key: string, value: float): void;

	function SetSettingInt(key: string, value: int32): void;

	function SetSettingString(key: string, value: string): void;

	/** @description Unregisters a previously registered event handler for a game event */
	function UnregisterGameEventHandler(callback: uuid): void;

	/** @description Gets the current game state. */
	function GetGameUIState(): GameUIState;
}

declare namespace RichPresenceAPI {
	/** @description Clears the current rich presence data */
	function Clear(): void;

	/** @description Updates the game's current rich presence state. */
	function UpdateRichPresenceState(state: {
		discord: {
			state: string;
			name: string;
			details: string;
			assets: {
				large_image: string;
				large_text: string;
			}
		}
	}): void;

}

declare namespace SteamOverlayAPI {
	/** @description Opens the steam overlay to the given user/group profile by their steam ID. profileID is the 64bit int steam ID in a string. */
	function OpenToProfileID(profileID: string): void;

	/** @description Opens the steam overlay browser at the given URL */
	function OpenURL(url: string): void;

	/** @description Opens the steam overlay browser at the given URL in a modal window (no other windows in overlay, and overlay closes when window closes) */
	function OpenURLModal(url: string): void;

}

declare namespace UiToolkitAPI {
	/** @description Denies input to the game by filtering input events. Returns a handle used by ReleaseDenyAllInputToGame. */
	function AddDenyAllInputToGame(panelPtr: unknown, strDebugContextName: string): uint64;

	/** @description Denies mouse input to the game by filtering mouse input events. Returns a handle used by ReleaseDenyMouseInputToGame. */
	function AddDenyMouseInputToGame(panelPtr: unknown, strDebugContextName: string): uint64;

	/** @description Force closing all visible popups */
	function CloseAllVisiblePopups(): void;

	/** @description Returns a global object that can be used to store global variables you would like to share across js files. */
	function GetGlobalObject(): unknown;

	/** @description Hide the tooltip with the given id. */
	function HideCustomLayoutTooltip(tooltipID: string): void;

	/** @description Hide the text tooltip */
	function HideTextTooltip(): void;

	/** @description Hide the title image text tooltip */
	function HideTitleImageTextTooltip(): void;

	/** @description Hide the title text tooltip */
	function HideTitleTextTooltip(): void;

	/** @description Invoke a javascript callback using a handle previously registered with RegisterJSCallback. First argument must be the callback handle followed by the callback's arguments. */
	function InvokeJSCallback(callback: uuid, ...args: any[]): void;

	/** @description Is Panorama in ECO (perf) mode */
	function IsPanoramaInECOMode(): boolean;

	function MakeStringSafe(str: string): string;

	/** @description Notify telemetry that a zone is been entered */
	function ProfilingScopeBegin(tagName: string): void;

	/** @description Notify telemetry that a zone is been left. Returns duration in milliseconds. */
	function ProfilingScopeEnd(): double;

	/** @description Register a HUD panel type name with the corresponding layout file */
	function RegisterHUDPanel2d(panelTypeName: string, layoutFile: string): void;

	/** @description Register a javascript callback that can be invoke at a later stage using InvokeJSCallback. Returns a callback handle. */
	function RegisterJSCallback(callback: Function): uuid;

	/** @description Register a panel type name with the corresponding layout file */
	function RegisterPanel2d(panelTypeName: string, layoutFile: string): void;

	/** @description ReleaseDenyAllInputToGame takes a handle as parameters previously returned by AddDenyAllInputToGame */
	function ReleaseDenyAllInputToGame(handle: uint64): void;

	/** @description ReleaseDenyMouseInputToGame takes a handle as parameters previously returned by AddDenyMouseInputToGame */
	function ReleaseDenyMouseInputToGame(handle: uint64): void;

	/** @description Show a context menu with a specific id and using the given layout. targetPanelID  can be the empty string in which case the cursor position is used to position the context menu. Returns context menu panel. */
	function ShowCustomLayoutContextMenu(targetPanelID: string, contentmenuID: string, layoutFile: string): unknown;

	/** @description Show a context menu with a specific id and using the given layout and parameters. targetPanelID  can be the empty string in which case the cursor position is used to position the context menu. Returns context menu panel. */
	function ShowCustomLayoutContextMenuParameters(targetPanelID: string, contentmenuID: string, layoutFile: string, parameters: string): unknown;

	/** @description Show a context menu with a specific id and using the given layout and parameters and call a function when dismissed. targetPanelID  can be the empty string in which case the cursor position is used to position the context menu. Returns context menu panel. */
	function ShowCustomLayoutContextMenuParametersDismissEvent(targetPanelID: string, contentmenuID: string, layoutFile: string, parameters: string, dismissJsFunc: unknown): unknown;

	/** @description Show a tooltip with a specifix id and using the given layout and parameters. */
	function ShowCustomLayoutParametersTooltip(targetPanelID: string, tooltipID: string, layoutFile: string, parameters: string): void;

	/** @description Show a tooltip with a specifix id and using the given layout and parameters. Also apply a CSS class named "style" (to the tooltip root panel) in order to allow custom styling (eg. "Tooltip_NoArrow" to remove tooltip's arrow). */
	function ShowCustomLayoutParametersTooltipStyled(targetPanelID: string, tooltipID: string, layoutFile: string, parameters: string, style: string): void;

	/** @description Show a popup that lets you specify a layout. */
	function ShowCustomLayoutPopup(popupID: string, layoutFile: string): unknown;

	/** @description Show a popup that lets you specify a layout and parameters. */
	function ShowCustomLayoutPopupParameters(popupID: string, layoutFile: string, parameters: string): unknown;

	/** @description Show a tooltip with a specifix id and using the given layout. */
	function ShowCustomLayoutTooltip(targetPanelID: string, tooltipID: string, layoutFile: string): void;

	/** @description Show a tooltip with a specifix id and using the given layout. Also apply a CSS class named "style" (to the tooltip root panel) in order to allow custom styling (eg. "Tooltip_NoArrow" to remove tooltip's arrow). */
	function ShowCustomLayoutTooltipStyled(targetPanelID: string, tooltipID: string, layoutFile: string, style: string): void;

	/** @description Show a popup with the given title add message and optional style. Button present: "OK". */
	function ShowGenericPopup(title: string, message: string, style: string): unknown;

	/** @description Show a popup with the given title add message and optional style. You can specify the background style ("none", "dim" or "blur"). Button present: "OK". */
	function ShowGenericPopupBgStyle(title: string, message: string, style: string, bgStyle: string): unknown;

	/** @description Show a popup with the given title add message and optional style. Button present: "Cancel". */
	function ShowGenericPopupCancel(title: string, message: string, style: string, cancelJSFunc: unknown): unknown;

	/** @description Show a popup with the given title add message and optional style. You can specify the background style ("none", "dim" or "blur"). Button present: "Cancel". */
	function ShowGenericPopupCancelBgStyle(title: string, message: string, style: string, cancelJSFunc: unknown, bgStyle: string): unknown;

	/** @description Show a popup with the given title add message and optional style. Button present: "OK". */
	function ShowGenericPopupOk(title: string, message: string, style: string, okJSFunc: unknown): unknown;

	/** @description Show a popup with the given title add message and optional style. You can specify the background style ("none", "dim" or "blur"). Button present: "OK". */
	function ShowGenericPopupOkBgStyle(title: string, message: string, style: string, okJSFunc: unknown, bgStyle: string): unknown;

	/** @description Show a popup with the given title add message and optional style. Button present: "Ok"/"Cancel". */
	function ShowGenericPopupOkCancel(title: string, message: string, style: string, okJSFunc: unknown, cancelJSFunc: unknown): unknown;

	/** @description Show a popup with the given title add message and optional style. You can specify the background style ("none", "dim" or "blur"). Button present: "Ok"/"Cancel". */
	function ShowGenericPopupOkCancelBgStyle(title: string, message: string, style: string, okJSFunc: unknown, cancelJSFunc: unknown, bgStyle: string): unknown;

	/** @description Show a popup with the given title add message and optional style and let you specify the name of one button. */
	function ShowGenericPopupOneOption(title: string, message: string, style: string, optionName: string, optionJSFunc: unknown): unknown;

	/** @description Show a popup with the given title add message and optional style and let you specify the name of one button. You can specify the background style ("none", "dim" or "blur").  */
	function ShowGenericPopupOneOptionBgStyle(title: string, message: string, style: string, optionName: string, optionJSFunc: unknown, bgStyle: string): unknown;

	/** @description Show a popup with the given title add message and optional style and let you specify the name of two button. */
	function ShowGenericPopupThreeOptions(title: string, message: string, style: string, option1Name: string, option1JSFunc: unknown, option2Name: string, option2JSFunc: unknown, option3Name: string, option3JSFunc: unknown): unknown;

	/** @description Show a popup with the given title add message and optional style and let you specify the name of two button. You can specify the background style ("none", "dim" or "blur").  */
	function ShowGenericPopupThreeOptionsBgStyle(title: string, message: string, style: string, option1Name: string, option1JSFunc: unknown, option2Name: string, option2JSFunc: unknown, option3Name: string, option3JSFunc: unknown, bgStyle: string): unknown;

	/** @description Show a popup with the given title add message and optional style and let you specify the name of two button. */
	function ShowGenericPopupTwoOptions(title: string, message: string, style: string, option1Name: string, option1JSFunc: unknown, option2Name: string, option2JSFunc: unknown): unknown;

	/** @description Show a popup with the given title add message and optional style and let you specify the name of two button. You can specify the background style ("none", "dim" or "blur").  */
	function ShowGenericPopupTwoOptionsBgStyle(title: string, message: string, style: string, option1Name: string, option1JSFunc: unknown, option2Name: string, option2JSFunc: unknown, bgStyle: string): unknown;

	/** @description Show a popup with the given title add message and optional style. Button present: "Yes"/"No". */
	function ShowGenericPopupYesNo(title: string, message: string, style: string, yesJSFunc: unknown, noJSFunc: unknown): unknown;

	/** @description Show a popup with the given title add message and optional style. You can specify the background style ("none", "dim" or "blur"). Button present: "Yes"/"No". */
	function ShowGenericPopupYesNoBgStyle(title: string, message: string, style: string, yesJSFunc: unknown, noJSFunc: unknown, bgStyle: string): unknown;

	/** @description Show a popup with the given title add message and optional style. Button present: "Yes"/"No"/"Cancel". */
	function ShowGenericPopupYesNoCancel(title: string, message: string, style: string, yesJSFunc: unknown, noJSFunc: unknown, cancelJSFunc: unknown): unknown;

	/** @description Show a popup with the given title add message and optional style. You can specify the background style ("none", "dim" or "blur"). Button present: "Yes"/"No"/"Cancel". */
	function ShowGenericPopupYesNoCancelBgStyle(title: string, message: string, style: string, yesJSFunc: unknown, noJSFunc: unknown, cancelJSFunc: unknown, bgStyle: string): unknown;

	/** @description Show a popup on the 'global popups top level window' that lets you specify a layout. */
	function ShowGlobalCustomLayoutPopup(popupID: string, layoutFile: string): unknown;

	/** @description Show a popup on 'global popups top level window' that lets you specify a layout and parameters. */
	function ShowGlobalCustomLayoutPopupParameters(popupID: string, layoutFile: string, parameters: string): unknown;

	/** @description Show a context menu with a specific id and populate the context menu item list using the given "items" array. Each elements of the items array is a javascript object of the form {label, jsCallback, style, icon}. targetPanelID  can be the empty string in which case the cursor position is used to position the context menu. Returns context menu panel. */
	function ShowSimpleContextMenu(targetPanelID: string, contentmenuID: string, items: unknown): unknown;

	/** @description Show a context menu with a specific id and populate the context menu item list using the given "items" array. Each elements of the items array is a javascript object of the form {label, jsCallback, style, icon}. targetPanelID  can be the empty string in which case the cursor position is used to position the context menu. Returns context menu panel. */
	function ShowSimpleContextMenuWithDismissEvent(targetPanelID: string, contentmenuID: string, items: unknown, dismissJsFunc: unknown): unknown;

	/** @description Show a tooltip with the given text */
	function ShowTextTooltip(targetPanelID: string, text: string): void;

	/** @description Show a tooltip with the given text on given panel */
	function ShowTextTooltipOnPanel(targetPanel: unknown, text: string): void;

	/** @description Show a tooltip with the given text on given panel. Also apply a CSS class named "style" to allow custom styling. */
	function ShowTextTooltipOnPanelStyled(targetPanel: unknown, text: string, style: string): void;

	/** @description Show a tooltip with the given text. Also apply a CSS class named "style" to allow custom styling. */
	function ShowTextTooltipStyled(targetPanelID: string, text: string, style: string): void;

	/** @description Show a tooltip with the given title, image and text. */
	function ShowTitleImageTextTooltip(targetPanelID: string, title: string, image: string, text: string): void;

	/** @description Show a tooltip with the giben title, image and text. Also apply a CSS class named "style" to allow custom styling. */
	function ShowTitleImageTextTooltipStyled(targetPanelID: string, title: string, image: string, text: string, style: string): void;

	/** @description Show a tooltip with the given title and text. */
	function ShowTitleTextTooltip(targetPanelID: string, title: string, text: string): void;

	/** @description Show a tooltip with the given title and text. Also apply a CSS class named "style" to allow custom styling. */
	function ShowTitleTextTooltipStyled(targetPanelID: string, title: string, text: string, style: string): void;

	/** @description Unregister a javascript callback previously registered with RegisterJSCallback. */
	function UnregisterJSCallback(jsCallbackHandle: int32): void;

}

declare namespace UserAPI {
	/** @description Gets the XUID (steamid as integer) of the local player */
	function GetXUID(): uint64;

}

declare namespace SentryAPI {
	/** @description Returns whether or not the user has consented to allow sentry to upload crash dumps. */
	function GetUserConsent(): boolean;

	/** @description Returns whether or not sentry is active. */
	function IsSentryActive(): boolean;
}

declare namespace VersionAPI {
	function GetBranch(): string;

	function GetGraphicsAPI(): string;

	function GetPhysicsEngine(): string;

	function GetPlatform(): string;

	function GetVersion(): string;
}
