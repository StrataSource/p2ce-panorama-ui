"use-strict";

// eslint-disable-next-line no-unused-vars
const ItemContextEntries = (function () {
	const _FilterEntries = function (populateFilterText) {
		const bHasFilter = populateFilterText !== "(not found)";

		return _Entries.filter(function (entry) {
			// exclusive only
			if (entry.exclusiveFilter) {
				return entry.exclusiveFilter.includes(populateFilterText);
			}
			// filter if specified
			else if (bHasFilter && entry.populateFilter) {
				return entry.populateFilter.includes(populateFilterText);
			}

			// if we don't have filter, just include everything that's not exclusive
			return !bHasFilter;
		});
	};

	const _CanEquipItem = function (itemID) {
		return ItemInfo.GetSlotSubPosition(itemID) && !ItemInfo.IsEquippalbleButNotAWeapon(itemID) && LoadoutAPI.IsLoadoutAllowed();
	};

	// --------------------------------------------------------------------------------------------------
	// Define new context menu entries here.
	// Uses iteminfo.js to get items info for from item ids
	// ItemInfo is a part of the script and you need to include it
	// --------------------------------------------------------------------------------------------------
	const _Entries = [
		/*
		{
			name: 'example', // Name must match the tail of the loc token for this entry
			populateFilter: ['bla'], // always include unless filter is specified
			exclusiveFilter: ['exclusive'], // only include this if matching filter is specified
			AvailableForItem: function ( id ) {
				// Decide if this context menu entry should show up for this item
				return true;	
			},
			OnSelected:  function ( id ) {
				// Called when the entry is selected
			}
		},
	*/
		{
			name: "preview",
			populateFilter: ["lootlist", "loadout", "tradeup_items", "tradeup_ingredients"],
			style: function (id) {
				const slotsub = ItemInfo.GetSlotSubPosition(id);
				return slotsub && (slotsub.startsWith("equipment") || slotsub.startsWith("grenade")) ? "" : "BottomSeparator";
			},
			AvailableForItem: function (id) {
				// Anything with an equip slot has a preview, as well as stickers
				return (
					(ItemInfo.GetSlotSubPosition(id) || ItemInfo.ItemMatchDefName(id, "sticker") || ItemInfo.ItemMatchDefName(id, "spray")) && !ItemInfo.ItemDefinitionNameSubstrMatch(id, "tournament_journal_") // We use a special inspect for the tournament Journal
				);
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				$.DispatchEvent("InventoryItemPreview", id);
			},
		},
		{
			name: "view_tournament_journal",
			populateFilter: ["inspect", "loadout"],
			style: function (id) {
				return false;
			},
			AvailableForItem: function (id) {
				return ItemInfo.ItemDefinitionNameSubstrMatch(id, "tournament_journal_");
			},
			OnSelected: function (id) {
				UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_tournament_journal.xml", "journalid=" + id);

				$.DispatchEvent("ContextMenuEvent", "");
			},
		},
		{
			name: "equip_both_teams",
			populateFilter: ["inspect", "loadout"],
			AvailableForItem: function (id) {
				if (ItemInfo.IsItemAnyTeam(id) && !ItemInfo.IsEquippedForCT(id) && !ItemInfo.IsEquippedForT(id)) {
					return _CanEquipItem(id);
				}
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				EquipItem(id, ["ct", "t"]);
			},
		},
		{
			// Replace CT item weapon
			name: "equip_ct",
			CustomName: function (id) {
				return _GetItemToReplaceName(id, "ct");
			},
			populateFilter: ["inspect", "loadout"],
			style: function (id) {
				return ItemInfo.IsItemAnyTeam(id) ? "" : "BottomSeparator";
			},
			AvailableForItem: function (id) {
				if ((ItemInfo.IsItemCt(id) || ItemInfo.IsItemAnyTeam(id)) && !ItemInfo.IsEquippedForCT(id)) {
					return _CanEquipItem(id);
				}
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				EquipItem(id, ["ct"]);
			},
		},
		{
			// Replace T item weapon
			name: "equip_t",
			CustomName: function (id) {
				return _GetItemToReplaceName(id, "t");
			},
			populateFilter: ["inspect", "loadout"],
			ToolTip: function (id) {
				return _GetItemToReplaceName(id, "ct");
			},
			style: function (id) {
				return ItemInfo.IsItemAnyTeam(id) || ItemInfo.IsItemT(id) ? "BottomSeparator" : "";
			},
			AvailableForItem: function (id) {
				if ((ItemInfo.IsItemT(id) || ItemInfo.IsItemAnyTeam(id)) && !ItemInfo.IsEquippedForT(id)) {
					return _CanEquipItem(id);
				}
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				EquipItem(id, ["t"]);
			},
		},
		{
			// Replace spray item weapon
			name: "flair",
			populateFilter: ["inspect", "loadout"],
			AvailableForItem: function (id) {
				return ItemInfo.GetSlotSubPosition(id) === "flair0" && (!ItemInfo.IsEquippedForNoTeam(id) || InventoryAPI.GetRawDefinitionKey(id, "item_sub_position2") !== "");
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				EquipItem(id, ["noteam"]);
			},
		},
		// Commenting out for now moving to the tournament info page
		// {
		// modify featured flair
		// 	name: 'modify_featured_flair',
		// 	populateFilter: ['inspect', 'loadout'],
		// 	AvailableForItem: function ( id ) {
		// 		return ItemInfo.ItemDefinitionNameSubstrMatch(id, 'tournament_journal_');
		// 	},
		// 	OnSelected: function( id )
		// 	{
		// 		$.DispatchEvent( 'ContextMenuEvent', '' );

		// 		UiToolkitAPI.ShowGenericPopupOk(
		// 			$.Localize( '#inv_context_modify_featured_flair' ),
		// 			$.Localize( '#inv_context_modify_featured_flair' ),
		// 			'',
		// 			function() {},
		// 			function() {}
		// 		);
		// 	}
		// },
		{
			// Replace spray item weapon
			name: "equip_spray",
			populateFilter: ["inspect", "loadout"],
			AvailableForItem: function (id) {
				return ItemInfo.ItemMatchDefName(id, "spraypaint") && !ItemInfo.IsEquippedForNoTeam(id);
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				EquipItem(id, ["noteam"], "spray0");
			},
		},
		{
			// Replace spray item weapon
			name: "equip_tournament_spray",
			populateFilter: ["inspect", "loadout"],
			AvailableForItem: function (id) {
				return ItemInfo.ItemDefinitionNameSubstrMatch(id, "tournament_journal_") && InventoryAPI.GetRawDefinitionKey(id, "item_sub_position2") === "spray0";
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");

				UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_tournament_select_spray.xml", "journalid=" + id);
			},
		},
		{
			// Musickit
			name: "equip_musickit",
			CustomName: function (id) {
				return _GetItemToReplaceName(id, "noteam");
			},
			populateFilter: ["inspect", "loadout"],
			style: function (id) {
				return ItemInfo.IsItemAnyTeam(id) || ItemInfo.IsItemT(id) ? "BottomSeparator" : "";
			},
			AvailableForItem: function (id) {
				return ItemInfo.GetSlotSubPosition(id) === "musickit" && !ItemInfo.IsEquippedForNoTeam(id);
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				const isMusicvolumeOn = InventoryAPI.TestMusicVolume();
				if (!isMusicvolumeOn) {
					$.DispatchEvent("ShowResetMusicVolumePopup", "");
				} else {
					$.DispatchEvent("PlaySoundEffect", "equip_musickit", "MOUSE");
					EquipItem(id, ["noteam"]);
				}
			},
		},
		{
			name: "open_watch_panel_pickem",
			AvailableForItem: function (id) {
				if (GameStateAPI.GetMapBSPName())
					// not available when connected to a server
					return false;
				return ItemInfo.ItemDefinitionNameSubstrMatch(id, "tournament_journal_") && InventoryAPI.GetRawDefinitionKey(id, "item_sub_position2") === "spray0";
			},
			OnSelected: function (id) {
				$.DispatchEvent("OpenWatchMenu");
				$.DispatchEvent("ShowActiveTournamentPage", "");
				$.DispatchEvent("ContextMenuEvent", "");
			},
		},
		{
			name: "useitem",
			AvailableForItem: function (id) {
				if (ItemInfo.ItemDefinitionNameSubstrMatch(id, "tournament_pass_")) return true;
				if (!InventoryAPI.IsTool(id)) return false;
				return InventoryAPI.GetItemAttributeValue(id, "season access") !== undefined; // this is an operation ticket pass
			},
			OnSelected: function (id) {
				if (ItemInfo.ItemDefinitionNameSubstrMatch(id, "tournament_pass_")) {
					UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_capability_decodable.xml", "key-and-case=," + id + "&" + "asyncworktype=decodeable");
				} else {
					UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_inventory_inspect.xml", "itemid=" + id + "&" + "asyncworktype=useitem");
				}

				$.DispatchEvent("ContextMenuEvent", "");
			},
		},
		{
			name: "usespray",
			populateFilter: ["inspect"],
			AvailableForItem: function (id) {
				return ItemInfo.ItemMatchDefName(id, "spray");
			},
			OnSelected: function (id) {
				UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_capability_decodable.xml", "key-and-case=," + id + "&" + "asyncworktype=decodeable");

				$.DispatchEvent("ContextMenuEvent", "");
			},
		},
		{
			name: "open_package",
			AvailableForItem: function (id) {
				return ItemInfo.ItemHasCapability(id, "decodable");
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");

				if (ItemInfo.GetChosenActionItemsCount(id, "decodable") === 0) {
					if (ItemInfo.IsTool(id)) {
						// User has no cases to this key, still show the empty dialog
						$.DispatchEvent("ShowSelectItemForCapabilityPopup", "decodable", id, "");
					} else {
						UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_capability_decodable.xml", "key-and-case=," + id + "&" + "asyncworktype=decodeable");
					}

					$.DispatchEvent("ContextMenuEvent", "");
					return;
				}

				$.DispatchEvent("ShowSelectItemForCapabilityPopup", "decodable", id, "");
			},
		},
		{
			name: "nameable",
			AvailableForItem: function (id) {
				return ItemInfo.ItemHasCapability(id, "nameable");
			},
			OnSelected: function (id) {
				if (_DoesNotHaveChosenActionItems(id, "nameable")) {
					const nameTagId = "";
					const itemToNameId = id;

					UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_capability_nameable.xml", "nametag-and-itemtoname=" + nameTagId + "," + itemToNameId + "&" + "asyncworktype=nameable");
				} else {
					$.DispatchEvent("ContextMenuEvent", "");
					$.DispatchEvent("ShowSelectItemForCapabilityPopup", "nameable", id, "");
				}
			},
		},
		{
			// Actual sticker not weapon that has 'can sticker' capability
			name: "can_sticker",
			populateFilter: ["inspect", "loadout"],
			AvailableForItem: function (id) {
				return ItemInfo.ItemMatchDefName(id, "sticker") && ItemInfo.ItemHasCapability(id, "can_sticker");
			},
			OnSelected: function (id) {
				$.DispatchEvent("PlaySoundEffect", "sticker_applySticker", "MOUSE");
				$.DispatchEvent("ContextMenuEvent", "");
				$.DispatchEvent("ShowSelectItemForCapabilityPopup", "can_sticker", id, "");
			},
		},
		{
			name: "can_sticker",
			AvailableForItem: function (id) {
				return ItemInfo.ItemHasCapability(id, "can_sticker") && ItemInfo.GetStickerSlotCount(id) > ItemInfo.GetStickerCount(id);
			},
			OnSelected: function (id) {
				$.DispatchEvent("PlaySoundEffect", "sticker_applySticker", "MOUSE");
				$.DispatchEvent("ContextMenuEvent", "");
				$.DispatchEvent("ShowSelectItemForCapabilityPopup", "can_sticker", id, "");
			},
		},
		{
			name: "remove_sticker",
			AvailableForItem: function (id) {
				return ItemInfo.ItemHasCapability(id, "can_sticker") && ItemInfo.GetStickerCount(id) > 0;
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");

				UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_capability_can_sticker.xml", "sticker-and-itemtosticker=remove" + "," + id + "&" + "asyncworktype=remove_sticker");
			},
		},
		{
			name: "recipe",
			AvailableForItem: function (id) {
				return ItemInfo.ItemMatchDefName(id, "recipe");
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
			},
		},
		{
			name: "can_stattrack_swap",
			AvailableForItem: function (id) {
				return ItemInfo.ItemHasCapability(id, "can_stattrack_swap") && InventoryAPI.IsTool(id);
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				$.DispatchEvent("ShowSelectItemForCapabilityPopup", "can_stattrack_swap", id, "");
			},
		},
		{
			name: "journal",
			AvailableForItem: function (id) {
				return false; // TODO: for the next operation
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
			},
		},
		{
			name: "openloadout",
			AvailableForItem: function (id) {
				const slotsub = ItemInfo.GetSlotSubPosition(id);
				return slotsub && slotsub !== "c4" && !slotsub.startsWith("equipment") && !slotsub.startsWith("grenade");
			},
			OnSelected: function (id) {
				/* FIXME: Pass team number if possible */
				const teamNum = ItemInfo.GetTeam(id).search("Team_T") === -1 ? 3 : 2;
				$.DispatchEvent("ContextMenuEvent", "");
				$.DispatchEvent("ShowLoadoutForItem", ItemInfo.GetSlot(id), ItemInfo.GetSlotSubPosition(id), teamNum);
			},
		},
		{
			// Trade up add
			name: "tradeup_add",
			populateFilter: ["tradeup_items"],
			AvailableForItem: function (id) {
				const slot = ItemInfo.GetSlotSubPosition(id);
				return slot && slot !== "melee" && slot !== "c4" && slot !== "clothing_hands" && !ItemInfo.IsEquippalbleButNotAWeapon(id) && (InventoryAPI.CanTradeUp(id) || InventoryAPI.GetNumItemsNeededToTradeUp(id) > 0);
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				InventoryAPI.AddCraftIngredient(id);
			},
		},
		{
			// Trade up remove
			name: "tradeup_remove",
			exclusiveFilter: ["tradeup_ingredients"],
			AvailableForItem: function (id) {
				const slot = ItemInfo.GetSlotSubPosition(id);
				return slot && slot !== "melee" && slot !== "c4" && slot !== "clothing_hands" && !ItemInfo.IsEquippalbleButNotAWeapon(id);
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				InventoryAPI.RemoveCraftIngredient(id);
			},
		},
		{
			// open tradeup contract
			name: "open_contract",
			AvailableForItem: function (id) {
				return ItemInfo.IsTradeUpContract(id);
			},
			OnSelected: function (id) {
				$.DispatchEvent("ShowTradeUpPanel");
				$.DispatchEvent("ContextMenuEvent", "");
			},
		},
		{
			name: "usegift",
			AvailableForItem: function (id) {
				return ItemInfo.GetToolType(id) === "gift";
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");

				const CapDisabledMessage = InventoryAPI.GetItemCapabilityDisabledMessageByIndex(id, 0);

				if (CapDisabledMessage === "") {
					// No error so go ahead and give the gift.
					UiToolkitAPI.ShowCustomLayoutPopupParameters(
						"",
						"file://{resources}/layout/popups/popup_inventory_inspect.xml",
						"itemid=" +
							id + // InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( 1353, 0 ) // Game License shooting guy
							"&" +
							"asyncworkitemwarning=no" +
							"&" +
							"asyncworktype=usegift"
					);
				} else {
					const capDisabledMessage = InventoryAPI.GetItemCapabilityDisabledMessageByIndex(id, 0);
					UiToolkitAPI.ShowGenericPopupOk(
						$.Localize("#inv_context_usegift"),
						$.Localize(capDisabledMessage),
						"",
						function () {},
						function () {}
					);
				}
			},
		},
		{
			name: "sell",
			style: function (id) {
				return "TopSeparator";
			},
			AvailableForItem: function (id) {
				return InventoryAPI.IsMarketable(id);
			},
			OnSelected: function (id) {
				$.DispatchEvent("PlaySoundEffect", "inventory_inspect_sellOnMarket", "MOUSE");
				$.DispatchEvent("ContextMenuEvent", "");
				InventoryAPI.SellItem(id);
			},
		},
		{
			name: "delete",
			style: function (id) {
				return !InventoryAPI.IsMarketable(id) ? "TopSeparator" : "";
			},
			AvailableForItem: function (id) {
				return InventoryAPI.IsDeletable(id);
			},
			OnSelected: function (id) {
				$.DispatchEvent("ContextMenuEvent", "");
				UiToolkitAPI.ShowCustomLayoutPopupParameters("", "file://{resources}/layout/popups/popup_inventory_inspect.xml", "itemid=" + id + "&" + "asyncworktype=delete" + "&" + "asyncworkbtnstyle=Negative");
			},
		},
	];

	// --------------------------------------------------------------------------------------------------
	// context menu specific helpers
	// --------------------------------------------------------------------------------------------------
	const _GetItemToReplaceName = function (id, team) {
		const currentEquippedItem = ItemInfo.GetItemIdForItemEquippedInLoadoutSlot(id, team);
		if (currentEquippedItem && currentEquippedItem !== "0") {
			$.GetContextPanel().SetDialogVariable("item_name", _GetNameWithRarity(currentEquippedItem));
			return $.Localize("inv_context_equip", $.GetContextPanel());
		}
		return "WRONG CONTEXT -_GetItemToReplaceName()" + id;
	};

	const _GetNameWithRarity = function (id) {
		const rarityColor = ItemInfo.GetRarityColor(id);
		return '<font color="' + rarityColor + '">' + ItemInfo.GetName(id) + "</font>";
	};

	const EquipItem = function (id, team, slot) {
		if (slot === null || slot === undefined || slot === "") slot = ItemInfo.GetSlotSubPosition(id); // item slot can be implied (most common scenario)

		team.forEach((element) => LoadoutAPI.EquipItemInSlot(element, id, slot));
	};

	const _DoesNotHaveChosenActionItems = function (id, capability) {
		return ItemInfo.GetChosenActionItemsCount(id, capability) === 0 && !ItemInfo.IsTool(id);
	};

	return {
		FilterEntries: _FilterEntries, // take filter string to match appropriate entires
	};
})();
