import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import { Growls } from '../../../../_common/growls/growls.service';
import { Site } from '../../../../_common/site/site-model';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import FormSiteSettings from '../../forms/site/settings/settings.vue';

@Component({
	components: {
		FormSiteSettings,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppSitesManagePageTemplate extends Vue {
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
		return Environment.baseUrlInsecure + `/site-editor/${tab}?id=${this.site!.id}`;
	}
}
