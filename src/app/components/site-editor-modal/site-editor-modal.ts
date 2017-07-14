import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./site-editor-modal.html?style=./site-editor-modal.styl';

import { BaseModal } from '../../../lib/gj-lib-client/components/modal/base';
import { Site } from '../../../lib/gj-lib-client/components/site/site-model';
import { SiteTemplate } from '../../../lib/gj-lib-client/components/site/template/template-model';
import { SiteTheme } from '../../../lib/gj-lib-client/components/site/theme/theme-model';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { AppThemeSelector } from '../../../lib/gj-lib-client/components/theme/selector/selector';
import { AppLoading } from '../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppThemeEditor } from '../../../lib/gj-lib-client/components/theme/theme-editor/theme-editor';
import { AppContentBlockEditor } from '../../../lib/gj-lib-client/components/content-block/editor/editor';

type EditorTab = 'theme' | 'content';

@View
@Component({
	components: {
		AppLoading,
		AppThemeSelector,
		AppThemeEditor,
		AppContentBlockEditor,
	},
})
export default class AppSiteEditorModal extends BaseModal {
	@Prop() siteId: number;
	@Prop() initialTab?: EditorTab;

	site: Site = null as any;
	templates: SiteTemplate[] = [];
	currentTemplateId = 0;
	theme: SiteTheme;

	isLoaded = false;
	tab: EditorTab = 'theme';

	private isDirty = false;
	// private locationWatcher: Function;

	async created() {
		this.tab = this.initialTab || 'theme';

		const response = await Api.sendRequest(
			`/web/dash/sites/editor/${this.siteId}`
		);

		this.isLoaded = true;
		this.site = new Site(response.site);
		this.templates = SiteTemplate.populate(response.templates);

		if (this.site.theme) {
			this.currentTemplateId = this.site.theme.template.id;
			this.theme = this.site.theme;
		}

		// TODO
		// location.hash('site-editor');
		// setTimeout(() => {
		// 	this.locationWatcher = this.$rootScope.$on('$locationChangeStart', e =>
		// 		this.locationChanged(e)
		// 	);
		// });
	}

	mounted() {
		document.body.classList.add('game-play-modal-open');
	}

	destroyed() {
		document.body.classList.remove('game-play-modal-open');
	}

	get siteUrl() {
		return this.site.url;
	}

	themeEdited($theme: any) {
		this.isDirty = true;
		this.theme.data = $theme;
	}

	contentEdited() {
		this.isDirty = true;
	}

	async save() {
		const data = {
			template_id: this.currentTemplateId,
			theme: this.theme.data,
			content_blocks: this.site.content_blocks,
		};

		this.isDirty = false;
		await Api.sendRequest(`/web/dash/sites/editor-save/${this.siteId}`, data, {
			sanitizeComplexData: false,
		});

		Growls.success(
			this.$gettext('Your site has been saved.'),
			this.$gettext('Site Saved')
		);
	}

	close() {
		// window.history.back();
		this.modal.dismiss();
	}

	// locationChanged(e: ng.IAngularEvent) {
	// 	if (
	// 		!this.isDirty ||
	// 		confirm(
	// 			this.$gettext(
	// 				'You have unsaved changes. Are you sure you want to discard them?'
	// 			)
	// 		)
	// 	) {
	// 		this._close.emit(undefined);
	// 		this.locationWatcher();
	// 	} else if (e) {
	// 		e.preventDefault();
	// 	}
	// }
}
