/* eslint-disable camelcase */

'use strict';

class WorkshopCampaignFlyout {
	static depsWrapper = $<Panel>('#DependenciesWrapper')!;
	static deps = $<Panel>('#Dependencies')!;
	static title = $<Label>('#Title')!;
	static author = $<Label>('#Author')!;
	static desc = $<Label>('#Description')!;
	static cover = $<Image>('#Cover')!;
	static votePanels = [
		$<RadioButton>('#Nonevote')!,
		$<RadioButton>('#Upvote')!,
		$<RadioButton>('#Downvote')!,
	];

	static addonId: number = 0;
	static workshopId: PublishedFileId_t = 0n;
	static campaign: string = '';
	static chapter: string = '';
	static hasMissing: boolean = false;
	static depsPanels: Map<PublishedFileId_t, {btn: Button, img: Image, loader: Panel}> = new Map();

	static onLoad() {
		const ctx = $.GetContextPanel();
		ctx.SetFocus();
		// MUST CHANGE IF ADDON REPRESENTATION CHANGES!!!!!
		this.addonId = ctx.GetAttributeInt('addon', 0);
		this.campaign = ctx.GetAttributeString('campaign', '');
		this.chapter = ctx.GetAttributeString('chapter', '');
		const meta = WorkshopAPI.GetAddonMeta(this.addonId);

		const rating = WorkshopAPI.GetAddonUserRating(this.addonId);
		this.votePanels[rating].SetSelected(true);

		this.workshopId = meta.workshopid;

		this.title.text = meta.title;
		if (meta.authors.length > 0) {
			for (let i = 0; i < meta.authors.length; ++i) {
				if (i !== 0) this.author.text += `, ${meta.authors[i]}`;
				else this.author.text += meta.authors[1];
			}
		} else {
			this.author.visible = false;
		}
		this.desc.text = $.BBCodeToHTML(meta.description);
		this.cover.SetImage(meta.thumb);

		const haveDeps = WorkshopAPI.GetAddonDependencies(this.addonId);
		const missingDeps = WorkshopAPI.GetAddonDependenciesMissing(this.addonId);
		const hasDeps = (missingDeps !== null && missingDeps.length > 0) || (haveDeps !== null && haveDeps.length > 0);
		if (missingDeps && missingDeps.length > 0) {
			this.hasMissing = true;
			for (const dep of missingDeps) {
				this.addDep(`${dep}`, dep, true);
			}
			WorkshopAPI.CreateQueryUGCDetailsRequest(
				(success: boolean, data: Array<SteamUGCDetails_t> | null) => {
					if (!success || data === null) return;
					for (const dep of data) {
						this.setDep(dep.m_nPublishedFileId, dep.m_rgchPreviewUrl);
					}
				},
				missingDeps
			);
		}
		if (haveDeps) {
			for (const dep of haveDeps) {
				const depMeta = WorkshopAPI.GetAddonMeta(dep);
				this.addDep(`${depMeta.workshopid}`, depMeta.workshopid, false);
				this.setDep(depMeta.workshopid, depMeta.thumb);
			}
		}
		this.depsWrapper.SetHasClass('hide', !hasDeps);

		$.RegisterForUnhandledEvent('PanoramaComponent_Workshop_OnAddonInstalled', (addon: AddonIndex_t) => {
			$.Msg('download!');
			const meta = WorkshopAPI.GetAddonMeta(addon);
			const panels = this.depsPanels.get(meta.workshopid);
			if (!panels) return;
			$.Msg(`got: ${meta.title}`);
			panels.btn.RemoveClass('workshop-campaign__dep__cover__missing');
		});
	}

	static addDep(id: string, workshopId: PublishedFileId_t, isMissing: boolean) {
		const b = $.CreatePanel(
			'Button',
			this.deps,
			id,
			{ class: `workshop-campaign__dep__cover${isMissing ? ' workshop-campaign__dep__cover__missing' : ''}` }
		);

		b.SetPanelEvent('onactivate', () => {
			SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`);
		});

		const img = $.CreatePanel(
			'Image',
			b,
			`${id}_Image`,
			{ class: 'workshop-campaign__dep__cover__image', scaling: 'stretch-to-cover-preserve-aspect' }
		);

		const loader = $.CreatePanel(
			'Panel',
			b,
			'Loader'
		);
		loader.LoadLayoutSnippet('Loader');

		this.depsPanels.set(workshopId, { btn: b, img: img, loader: loader });
	}

	static setDep(workshopId: PublishedFileId_t, previewUrl: string) {
		const panels = this.depsPanels.get(workshopId);
		if (!panels) {
			$.Warning(`Could not find panel for ${workshopId}`);
			return;
		}
		panels.img.SetImage(previewUrl);
		panels.loader.visible = false;
	}

	static clearMissing(workshopId: PublishedFileId_t) {
		const panels = this.depsPanels.get(workshopId);
		if (!panels) {
			$.Warning(`Could not find panel for ${workshopId}`);
			return;
		}
		panels.btn.RemoveClass('workshop-campaign__dep__cover__missing');
	}

	static play() {
		if (this.hasMissing) {
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'dependencies',
				'file://{resources}/layout/modals/popups/addon-dependencies.xml',
				`addon=${this.addonId}&action=0&campaignId=${this.campaign}&chapterId=${this.chapter}&map=0`
			);
		} else {
			CampaignAPI.StartCampaign(
				this.campaign,
				this.chapter,
				0
			);
			UiToolkitAPI.CloseAllVisiblePopups();
		}
	}

	static openInSteam() {
		SteamOverlayAPI.OpenURLModal(`https://steamcommunity.com/sharedfiles/filedetails/?id=${this.workshopId}`);
	}

	static changeVote(vote: AddonRating) {
		WorkshopAPI.SetAddonUserRating(this.addonId, vote);
	}
}
