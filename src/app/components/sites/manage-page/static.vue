<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { SiteBuild } from '../../../../_common/site/build/build-model';
import { Site } from '../../../../_common/site/site-model';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import FormDashSiteBuild from '../../forms/site/build/build.vue';

@Options({
	components: {
		FormDashSiteBuild,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppSitesManagePageStatic extends Vue {
	@Prop(Object) site?: Site;
	@Prop(Boolean) enabled?: boolean;
	@Prop(Boolean) templateEnabled?: boolean;

	get enableTooltip() {
		return this.templateEnabled
			? this.$gettext('This will disable your template and use your static build instead.')
			: undefined;
	}

	onBuildAdded(_model: SiteBuild, response: any) {
		if (!this.site) {
			showErrorGrowl(this.$gettext(`Site is not active`));
			return;
		}

		// Only alert if they had a build previously and uploaded a new one.
		if (this.site.build) {
			showSuccessGrowl(
				this.$gettext(`Your new site build is now active.`),
				this.$gettext(`Site Updated`)
			);
		}

		this.site.assign(response.site);
	}

	async activateBuild() {
		if (!this.site || !this.site.build) {
			showErrorGrowl(this.$gettext(`Site or build is not active`));
			return;
		}

		try {
			const response = await Api.sendRequest(
				`/web/dash/sites/activate-primary-build/${this.site.id}`,
				{},
				{ noErrorRedirect: true }
			);

			if (response.errors && response.errors.domain_in_use) {
				showErrorGrowl(this.$gettext('Domain is already in use in another site.'));
				return;
			}

			if (response.site) {
				this.site.assign(response.site);
			}
		} catch (e) {
			console.error(e);
			showErrorGrowl(this.$gettext(`Something went wrong.`));
		}
	}
}
</script>

<template>
	<div>
		<div v-if="!enabled" class="well fill-offset text-center">
			<div class="row">
				<div class="col-xs-8 col-centered">
					<p class="lead">
						<AppTranslate>
							Have a site already or want to create one from scratch? Upload a .zip
							file of your site's content and we'll host it for you!
						</AppTranslate>
					</p>

					<FormDashSiteBuild v-if="!site.build" :site="site" @submit="onBuildAdded" />

					<AppButton
						v-else
						v-app-tooltip="enableTooltip"
						primary
						@click="activateBuild()"
					>
						<AppTranslate>Turn On</AppTranslate>
					</AppButton>
				</div>
			</div>
		</div>
		<div v-else>
			<h2><AppTranslate>Upload a New Build</AppTranslate></h2>

			<FormDashSiteBuild :site="site" @submit="onBuildAdded" />
		</div>
	</div>
</template>
