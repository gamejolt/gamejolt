import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { SiteBuild } from 'game-jolt-frontend-lib/components/site/build/build-model';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import FormDashSiteBuild from '../../forms/site/build/build.vue';


@Component({
	components: {
		FormDashSiteBuild,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppSitesManagePageStatic extends Vue {
	@Prop(Site) site?: Site;
	@Prop(Boolean) enabled?: boolean;
	@Prop(Boolean) templateEnabled?: boolean;

	onBuildAdded(_model: SiteBuild, response: any) {
		if (!this.site) {
			Growls.error(this.$gettext(`Site is not active`));
			return;
		}

		// Only alert if they had a build previously and uploaded a new one.
		if (this.site.build) {
			Growls.success(
				this.$gettext(`Your new site build is now active.`),
				this.$gettext(`Site Updated`)
			);
		}

		this.site.assign(response.site);
	}

	async activateBuild() {
		if (!this.site || !this.site.build) {
			Growls.error(this.$gettext(`Site or build is not active`));
			return;
		}

		try {
			const response = await Api.sendRequest(
				`/web/dash/sites/activate-primary-build/${this.site.id}`,
				{}
			);
			this.site.assign(response.site);
		} catch (e) {
			console.error(e);
			Growls.error(this.$gettext(`Something went wrong.`));
		}
	}
}
