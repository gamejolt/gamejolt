<script lang="ts" setup>
import { computed } from 'vue';

import FormDashSiteBuild from '~app/components/forms/site/build/FormSiteBuild.vue';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { showErrorGrowl, showSuccessGrowl } from '~common/growls/growls.service';
import { SiteBuildModel } from '~common/site/build/build-model';
import { SiteModel } from '~common/site/site-model';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	site?: SiteModel;
	enabled?: boolean;
	templateEnabled?: boolean;
};

const { site, enabled, templateEnabled } = defineProps<Props>();

const enableTooltip = computed(() => {
	return templateEnabled
		? $gettext('This will disable your template and use your static build instead.')
		: undefined;
});

function onBuildAdded(_model: SiteBuildModel, response: any) {
	if (!site) {
		showErrorGrowl($gettext(`Site is not active`));
		return;
	}

	if (site.build) {
		showSuccessGrowl($gettext(`Your new site build is now active.`), $gettext(`Site Updated`));
	}

	site.assign(response.site);
}

async function activateBuild() {
	if (!site || !site.build) {
		showErrorGrowl($gettext(`Site or build is not active`));
		return;
	}

	try {
		const response = await Api.sendRequest(
			`/web/dash/sites/activate-primary-build/${site.id}`,
			{},
			{ noErrorRedirect: true }
		);

		if (response.errors && response.errors.domain_in_use) {
			showErrorGrowl($gettext('Domain is already in use in another site.'));
			return;
		}

		if (response.site) {
			site.assign(response.site);
		}
	} catch (e) {
		console.error(e);
		showErrorGrowl($gettext(`Something went wrong.`));
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

					<FormDashSiteBuild
						v-if="site && !site.build"
						:site="site"
						@submit="onBuildAdded"
					/>

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

			<FormDashSiteBuild :site="site!" @submit="onBuildAdded" />
		</div>
	</div>
</template>
