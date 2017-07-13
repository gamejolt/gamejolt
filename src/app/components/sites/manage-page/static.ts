import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./static.html';
import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { FormDashSiteBuild } from '../../forms/site/build/build';

@View
@Component({
	components: {
		FormDashSiteBuild,
	},
	directives: {
		AppTooltip,
	},
})
export class AppSitesManagePageStatic extends Vue {
	@Prop(Site) site?: Site;
	@Prop(Boolean) enabled: boolean;
	@Prop(Boolean) templateEnabled: boolean;

	onBuildAdded(model: any, response: any) {
		console.log(model);
		console.log(response);

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
		} catch (err) {
			console.error(err);
			Growls.error(this.$gettext(`Something went wrong.`));
		}
	}
}
