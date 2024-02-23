'use strict';

class ChapterSelect {

	static panels = [];

	static {
		const chapterList = $('#ChapterList');
		chapterList.ScrollParentToMakePanelFit(1, false);

		const chapterInfo = $('#ChapterInfo');
		chapterInfo.ScrollParentToMakePanelFit(1, false);

		this.createChapterEntries();
	}

	static createChapterEntries() {
		const chapters = $.LoadKeyValues3File('panorama/data/chapters.kv3');

		const len = this.panels.length;
		for (let i = 0; i < len; i++) {
			panel.DeleteAsync();
		}
		this.panels = [];

		for (const chapter of chapters.chapters) {
			$.Msg(chapter.name);
			const panel = $.CreatePanel('Panel', $('#ChapterList'), chapter.name);
			panel.LoadLayoutSnippet('ChapterEntry');
			panel.SetDialogVariable('chapter-title', chapter.title); 
			panel.SetDialogVariable('chapter-subtitle', chapter.subtitle); 
			panel.SetDialogVariable('chapter-icon', chapter.icon);
			panel.FindChild('ChapterLogo').SetImage(chapter.icon);

			this.panels.push(panel);
		}
	}

}
