<script lang="ts" setup>
import { computed } from 'vue';

import FormSiteSettings from '~app/components/forms/site/settings/FormSiteSettings.vue';
import AppButton from '~common/button/AppButton.vue';
import { Environment } from '~common/environment/environment.service';
import { showErrorGrowl, showSuccessGrowl } from '~common/growls/growls.service';
import { $activateSite, SiteModel } from '~common/site/site-model';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	site?: SiteModel;
	enabled?: boolean;
	staticEnabled?: boolean;
};

const { site, enabled, staticEnabled } = defineProps<Props>();

const themeEditorLocation = computed(() => {
	return getEditorLocation('theme');
});

const contentEditorLocation = computed(() => {
	return getEditorLocation('content');
});

const enableTooltip = computed(() => {
	return staticEnabled
		? $gettext('This will disable your static site and use a customizable template instead.')
		: undefined;
});

function enable() {
	if (!site) {
		return;
	}

	$activateSite(site).catch(e => {
		if (e.errors && e.errors.domain_in_use) {
			showErrorGrowl($gettext('Domain is already in use in another site.'));
		}
	});
}

function onSettingsSaved() {
	showSuccessGrowl($gettext(`Your site settings have been saved.`), $gettext(`Settings Saved`));
}

function getEditorLocation(tab: string) {
	return Environment.baseUrlInsecure + `/site-editor/${tab}?id=${site!.id}`;
}
</script>

<template>
	<div>
		<div v-if="!enabled" class="well fill-offset text-center">
			<div class="row">
				<div class="col-xs-8 col-centered">
					<p class="lead">
						<AppTranslate>
							Use one of our pre-built templates and customize it to your style.
						</AppTranslate>
					</p>

					<AppButton v-app-tooltip="enableTooltip" primary @click="enable()">
						<AppTranslate>Turn On</AppTranslate>
					</AppButton>
				</div>
			</div>
		</div>
		<div v-else>
			<div class="alert alert-notice visible-xs full-bleed-xs">
				<p>
					<AppTranslate>
						The site editor doesn't work on mobile devices at this time.
					</AppTranslate>
				</p>
			</div>

			<div class="hidden-xs">
				<AppButton :href="themeEditorLocation" target="_blank">
					<AppTranslate>Customize Theme</AppTranslate>
				</AppButton>

				<AppButton :href="contentEditorLocation" target="_blank">
					<AppTranslate>Edit Content</AppTranslate>
				</AppButton>
			</div>

			<h2>
				<AppTranslate>Settings</AppTranslate>
			</h2>

			<FormSiteSettings :model="site" @submit="onSettingsSaved" />
		</div>
	</div>
</template>
