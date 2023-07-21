<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../AppFadeCollapse.vue';
import { Analytics } from '../../../analytics/analytics.service';
import AppCard from '../../../card/AppCard.vue';
import { Navigate } from '../../../navigate/navigate.service';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import { GameBuildPlatformSupportInfo } from '../../build/build.model';
import { GameExternalPackage } from '../external-package.model';

@Options({
	components: {
		AppCard,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppGameExternalPackageCard extends Vue {
	@Prop(Object)
	package!: GameExternalPackage;

	showFullDescription = false;
	canToggleDescription = false;

	readonly GameBuildPlatformSupportInfo = GameBuildPlatformSupportInfo;

	get platforms() {
		const platforms = [];
		for (let prop in this.package) {
			if (!(this.package as any)[prop]) {
				continue;
			}

			for (let prefix of ['os_', 'type_']) {
				if (!prop.startsWith(prefix)) {
					continue;
				}

				const field = prop.substr(prefix.length);
				if (field in GameBuildPlatformSupportInfo) {
					platforms.push(field);
				}
			}
		}
		return platforms;
	}

	gotoExternal() {
		Analytics.trackEvent('game-package-card', 'download', 'external');

		Navigate.newWindow(this.package.url);
	}
}
</script>

<template>
	<AppCard :id="`game-external-package-card-${package.id}`" class="game-external-package-card">
		<div class="card-title">
			<h4>
				{{ package.title }}
			</h4>
		</div>

		<div v-if="platforms.length" class="card-meta card-meta-sm">
			<AppJolticon
				v-for="platform of platforms"
				:key="platform"
				v-app-tooltip="GameBuildPlatformSupportInfo[platform].tooltip"
				:icon="GameBuildPlatformSupportInfo[platform].icon"
			/>
		</div>

		<div v-if="package.description" class="card-content">
			<AppFadeCollapse
				:collapse-height="100"
				:is-open="showFullDescription"
				@require-change="canToggleDescription = $event"
				@expand="showFullDescription = true"
			>
				<div>{{ package.description }}</div>
			</AppFadeCollapse>

			<a
				v-if="canToggleDescription"
				v-app-track-event="`game-package-card:show-full-description`"
				class="hidden-text-expander"
				@click="showFullDescription = !showFullDescription"
			/>
		</div>

		<div class="card-controls">
			<AppButton
				v-app-tooltip="$gettext(`Play Off-Site`)"
				primary
				icon="world"
				@click="gotoExternal()"
			>
				<AppTranslate>Play</AppTranslate>
			</AppButton>
		</div>
	</AppCard>
</template>

<style lang="stylus" scoped>
.game-external-package-card
	.card
		padding-bottom: 0

	.card-controls
		margin-bottom: 10px

		small
			margin-left: 5px
</style>
