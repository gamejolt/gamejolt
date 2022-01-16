<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { Site } from '../../../../_common/site/site-model';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import FormSiteSettings from '../../forms/site/settings/settings.vue';

@Options({
	components: {
		FormSiteSettings,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppSitesManagePageTemplate extends Vue {
	@Prop(Object) site?: Site;
	@Prop(Boolean) enabled?: boolean;
	@Prop(Boolean) staticEnabled?: boolean;

	get themeEditorLocation() {
		return this.getEditorLocation('theme');
	}

	get contentEditorLocation() {
		return this.getEditorLocation('content');
	}

	get enableTooltip() {
		return this.staticEnabled
			? this.$gettext(
					'This will disable your static site and use a customizable template instead.'
			  )
			: undefined;
	}

	enable() {
		if (!this.site) {
			return;
		}

		this.site.$activate().catch(e => {
			if (e.errors && e.errors.domain_in_use) {
				showErrorGrowl(this.$gettext('Domain is already in use in another site.'));
			}
		});
	}

	onSettingsSaved() {
		showSuccessGrowl(
			this.$gettext(`Your site settings have been saved.`),
			this.$gettext(`Settings Saved`)
		);
	}

	private getEditorLocation(tab: string) {
		return Environment.baseUrlInsecure + `/site-editor/${tab}?id=${this.site!.id}`;
	}
}
</script>

<template>
	<div>
		<div v-if="!enabled" class="well fill-offset text-center">
			<div class="row">
				<div class="col-xs-8 col-centered">
					<p class="lead">
						<translate>
							Use one of our pre-built templates and customize it to your style.
						</translate>
					</p>

					<app-button v-app-tooltip="enableTooltip" primary @click="enable()">
						<translate>Turn On</translate>
					</app-button>
				</div>
			</div>
		</div>
		<div v-else>
			<div class="alert alert-notice visible-xs full-bleed-xs">
				<p>
					<translate>
						The site editor doesn't work on mobile devices at this time.
					</translate>
				</p>
			</div>

			<div class="hidden-xs">
				<app-button :href="themeEditorLocation" target="_blank">
					<translate>Customize Theme</translate>
				</app-button>

				<app-button :href="contentEditorLocation" target="_blank">
					<translate>Edit Content</translate>
				</app-button>
			</div>

			<h2>
				<translate>Settings</translate>
			</h2>

			<form-site-settings :model="site" @submit="onSettingsSaved" />
		</div>
	</div>
</template>
