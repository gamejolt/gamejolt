import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import FormSiteSettings from '../../forms/site/settings/settings.vue';


@Component({
	components: {
		AppJolticon,
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
