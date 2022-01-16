<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../analytics/analytics.service';
import AppCard from '../../../card/card.vue';
import AppFadeCollapse from '../../../fade-collapse/fade-collapse.vue';
import { Navigate } from '../../../navigate/navigate.service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { GameBuild } from '../../build/build.model';
import { GameExternalPackage } from '../external-package.model';

@Options({
	components: {
		AppCard,
		AppFadeCollapse,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppGameExternalPackageCard extends Vue {
	@Prop(Object)
	package!: GameExternalPackage;

	showFullDescription = false;
	canToggleDescription = false;

	readonly GameBuild = GameBuild;

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
				if (field in GameBuild.platformSupportInfo) {
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
	<app-card :id="`game-external-package-card-${package.id}`" class="game-external-package-card">
		<div class="card-title">
			<h4>
				{{ package.title }}
			</h4>
		</div>

		<div v-if="platforms.length" class="card-meta card-meta-sm">
			<app-jolticon
				v-for="platform of platforms"
				:key="platform"
				v-app-tooltip="GameBuild.platformSupportInfo[platform].tooltip"
				:icon="GameBuild.platformSupportInfo[platform].icon"
			/>
		</div>

		<div v-if="package.description" class="card-content">
			<app-fade-collapse
				:collapse-height="100"
				:is-open="showFullDescription"
				@require-change="canToggleDescription = $event"
				@expand="showFullDescription = true"
			>
				<div>{{ package.description }}</div>
			</app-fade-collapse>

			<a
				v-if="canToggleDescription"
				v-app-track-event="`game-package-card:show-full-description`"
				class="hidden-text-expander"
				@click="showFullDescription = !showFullDescription"
			/>
		</div>

		<div class="card-controls">
			<app-button
				v-app-tooltip="$gettext(`Play Off-Site`)"
				primary
				icon="world"
				@click="gotoExternal()"
			>
				<translate>Play</translate>
			</app-button>
		</div>
	</app-card>
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
