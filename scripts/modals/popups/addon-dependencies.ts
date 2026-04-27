/* eslint-disable camelcase */

'use strict';

class DependencyWrap {
	workshopid: number;
	title: string;
	image: string;

	constructor(workshopid: number, title: string, image: string) {
		this.workshopid = workshopid;
		this.title = title;
		this.image = image;
	}
}

class AddonDependencies {
	static list = $('#DependenciesPanel')!;
	static continueBtn = $<Button>('#ContinueButton')!;
	static continueText = $<Label>('#ContinueText')!;
	static header = $<Label>('#Header')!;
	static desc = $<Label>('#Desc')!;

	static entries: Map<PublishedFileId_t, GenericPanel> = new Map();
	static downloadCount = 0;

	static newAddonInstalled(addon: AddonIndex_t) {
		const meta = WorkshopAPI.GetAddonMeta(addon);
		const entry = this.entries.get(meta.workshopid);
		if (!entry) {
			return;
		}
		entry.enabled = false;
		entry.AddClass('addon-deps__downloaded');
		this.downloadCount += 1;

		if (this.downloadCount < this.entries.size) return;

		this.continueBtn.RemoveClass('button--red');
		this.continueText.text = $.Localize('#UI_Continue');
		this.header.text = $.Localize('#DependencyWarning_Resolved_Header');
		this.desc.text = $.Localize('#DependencyWarning_Resolved_Desc');
	}

	static onLoad() {
		$('#CancelButton')!.SetFocus();
		this.checkAddons();
		$.RegisterForUnhandledEvent('PanoramaComponent_Workshop_OnAddonInstalled', (addon: AddonIndex_t) => {
			this.newAddonInstalled(addon);
		});
		this.continueBtn.SetPanelEvent('onactivate', () => {
			const ctx = $.GetContextPanel();
			const action = ctx.GetAttributeInt('action', 0);
			switch (action) {
				case 0:
					{
						const cid = ctx.GetAttributeString('campaignId', '');
						const chid = ctx.GetAttributeString('chapterId', '');
						const map = ctx.GetAttributeInt('map', 0);

						if (cid.length === 0 || chid.length === 0) {
							$.Warning('Action is invalid.');
							return;
						}

						CampaignAPI.StartCampaign(cid, chid, map);
					}
					break;

				case 1:
					$.DispatchEvent('MainMenuCloseAllPages');
					$.DispatchEvent('MainMenuAnimatedSwitch', ctx.GetAttributeString('campaign', ''));
					break;

				default:
					break;
			}

			UiToolkitAPI.CloseAllVisiblePopups();
		});
	}

	static checkAddons() {
		// THIS HAS TO CHANGE IF THE REPRESENTATION FOR ADDONS IS CHANGED TO BE NOT A NUMBER!!!!
		const addon: AddonIndex_t = $.GetContextPanel().GetAttributeInt('addon', 0);
		const deps = WorkshopAPI.GetAddonDependenciesMissing(addon);

		if (deps === null || deps.length === 0) {
			$.Warning(`Addon ${addon} has no missing dependencies!`);
			$.DispatchEvent('Cancelled', $.GetContextPanel(), PanelEventSource.PROGRAM);
			return;
		}

		for (const dep of deps) {
			const p = $.CreatePanel('Button', this.list, `${dep}`);
			p.LoadLayoutSnippet('DependencyEntry');
			p.SetPanelEvent('onactivate', () => {
				SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/sharedfiles/filedetails/?id=${dep}`);
			});

			this.entries.set(dep, p);
		}

		WorkshopAPI.CreateQueryUGCDetailsRequest((success: boolean, data: Array<SteamUGCDetails_t> | null) => {
			if (!success || !data) {
				this.markAllFailed();
				return;
			}

			for (const item of data) {
				this.setEntry(item.m_nPublishedFileId, item.m_rgchTitle, item.m_rgchDescription, item.m_rgchPreviewUrl);
			}
		}, deps);
	}

	static setEntry(addon: PublishedFileId_t, name: string, desc: string, coverURL: string) {
		const entry = this.entries.get(addon);

		if (!entry) {
			$.Warning(`Could not find panel for response ${addon}`);
			return;
		}

		const title = entry.FindChildTraverse<Label>('DependencyAddonTitle')!;
		const descP = entry.FindChildTraverse<Label>('DependencyAddonDesc')!;
		const cover = entry.FindChildTraverse<Image>('DependencyAddonImage')!;
		const loader = entry.FindChildTraverse<Panel>('Loader')!;

		loader.visible = false;
		cover.SetImage(coverURL);
		title.text = name;

		if (desc.length > 0) {
			descP.visible = true;
			descP.text = $.BBCodeToHTML(desc);
		}
	}

	static markAllFailed() {
		$.Warning('Could not retrieve details');
		for (const [addon, entry] of this.entries) {
			const title = entry.FindChildTraverse<Label>('DependencyAddonTitle')!;
			const cover = entry.FindChildTraverse<Image>('DependencyAddonImage')!;
			const loader = entry.FindChildTraverse<Panel>('Loader')!;

			loader.visible = false;
			cover.SetImage('file://{images}/menu/fallback/dead_atlas.png');
			title.text = $.Localize('#DependencyWarning_Failed');
		}
	}

	static close() {
		$.DispatchEvent('Cancelled', $.GetContextPanel(), PanelEventSource.PROGRAM);
	}
}
