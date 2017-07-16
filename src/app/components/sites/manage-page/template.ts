import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./template.html';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
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
	@Prop(Boolean) enabled?: boolean;
	@Prop(Boolean) staticEnabled?: boolean;

	get themeEditorLocation() {
		return this.getEditorLocation('theme');
	}

	get contentEditorLocation() {
		return this.getEditorLocation('content');
	}

	enable() {
		if (this.site) {
			return this.site.$activate();
		}
	}

	onSettingsSaved() {
		Growls.success(
			this.$gettext(`Your site settings have been saved.`),
			this.$gettext(`Settings Saved`)
		);
	}

	private getEditorLocation(tab: string) {
		let name = 'dash.main.site.editor';
		if (this.site!.game_id) {
			name = 'dash.games.manage.site.editor';
		}

		return {
			name,
			params: Object.assign({}, this.$route, { tab }),
		};
	}
}
