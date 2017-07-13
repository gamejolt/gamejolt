import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./template.html';
import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
// import { SiteEditorModal } from '../../site-editor-modal/site-editor-modal.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { FormSiteSettings } from '../../forms/site/settings/settings';

@View
@Component({
	components: {
		AppJolticon,
		FormSiteSettings,
	},
	directives: {
		AppTooltip,
	},
})
export class AppSitesManagePageTemplate extends Vue {
	@Prop(Site) site?: Site;
	@Prop(Boolean) enabled: boolean;
	@Prop(Boolean) staticEnabled: boolean;

	enable() {
		if (this.site) {
			return this.site.$activate();
		}
	}

	showEditor(tab: 'theme' | 'content') {
		if (this.site) {
			SiteEditorModal.show(this.site.id, tab);
		}
	}

	onSettingsSaved() {
		Growls.success(
			this.$gettext(`Your site settings have been saved.`),
			this.$gettext(`Settings Saved`)
		);
	}
}
