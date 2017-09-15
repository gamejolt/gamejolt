import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./site-editor.html?style=./site-editor.styl';

import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { AppThemeSelector } from '../../../lib/gj-lib-client/components/theme/selector/selector';
import { AppLoading } from '../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppThemeEditor } from '../../../lib/gj-lib-client/components/theme/theme-editor/theme-editor';
import { AppContentBlockEditor } from '../../../lib/gj-lib-client/components/content-block/editor/editor';
import { Store } from '../../store/index';

@View
@Component({
	components: {
		AppLoading,
		AppThemeSelector,
		AppThemeEditor,
		AppContentBlockEditor,
	},
})
export class AppSiteEditor extends Vue {
	@State tab: Store['tab'];
	@State site: Store['site'];
	@State templates: Store['templates'];
	@State currentTemplateId: Store['currentTemplateId'];
	@State theme: Store['theme'];
	@State isLoaded: Store['isLoaded'];

	isDirty = false;

	get siteUrl() {
		return this.site.url;
	}

	get confirmMessage() {
		return this.$gettext('You have unsaved changes. Are you sure you want to discard them?');
	}

	mounted() {
		this.$router.beforeEach((_to, _from, next) => {
			if (!this.canLeave()) {
				return next(false);
			}
			this.isDirty = false;
			next();
		});

		window.onbeforeunload = () => {
			if (this.isDirty) {
				return this.confirmMessage;
			}
		};
	}

	themeEdited($theme: any) {
		this.isDirty = true;
		this.theme.data = $theme;
	}

	contentEdited() {
		this.isDirty = true;
	}

	canLeave() {
		return !this.isDirty || confirm(this.confirmMessage);
	}

	async save() {
		const data = {
			template_id: this.currentTemplateId,
			theme: this.theme.data,
			content_blocks: this.site.content_blocks,
		};

		this.isDirty = false;
		await Api.sendRequest(`/web/dash/sites/editor-save/${this.site.id}`, data, {
			sanitizeComplexData: false,
		});

		Growls.success(this.$gettext('Your site has been saved.'), this.$gettext('Site Saved'));
	}
}
