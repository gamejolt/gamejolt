<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/AppGameThumbnail.vue';
import AppClientGameButtons from '../../../../components/client/game-buttons/game-buttons.vue';
import { LocalDbGame } from '../../../../components/client/local-db/game/game.model';
import { useClientLibraryStore } from '../../../../store/client-library/index';

@Options({
	components: {
		AppGameThumbnail,
		AppClientGameButtons,
	},
})
export default class AppLibraryInstalledGame extends Vue {
	@Prop(Object)
	game!: LocalDbGame;

	readonly clientLibrary = shallowSetup(() => useClientLibraryStore());

	isHovering = false;
	isShowingOptions = false;
	isShowingLaunchOptions = false;

	get hasMultiplePackages() {
		const len = this.clientLibrary.packagesByGameId.value[this.game.id]?.length ?? 0;
		return len > 1;
	}

	get packageVersion() {
		const firstPackage = this.clientLibrary.packagesByGameId.value[this.game.id]?.[0] ?? null;
		return firstPackage?.release.version_number ?? '0.0.0';
	}

	get isInstalling() {
		return this.clientLibrary.packages.value.some(i => {
			return !!i.install_state && i.game_id === this.game.id;
		});
	}

	get isUpdating() {
		return this.clientLibrary.packages.value.some(i => {
			return !!i.update_state && i.game_id === this.game.id;
		});
	}

	get shouldShowControls() {
		return (
			this.isHovering ||
			this.isShowingOptions ||
			this.isShowingLaunchOptions ||
			this.isInstalling ||
			this.isUpdating
		);
	}
}
</script>

<template>
	<div
		class="client-installed-game"
		:class="{
			'-is-installing': isInstalling,
			'-is-active': isShowingOptions || isShowingLaunchOptions,
		}"
		@mouseenter="isHovering = true"
		@mouseleave="isHovering = false"
	>
		<AppGameThumbnail class="-thumb" :game="game._game" hide-pricing />

		<div v-if="shouldShowControls" class="-meta-outer">
			<div class="-meta">
				<AppClientGameButtons
					:game="game._game"
					overlay
					has-installable-builds
					can-install
					@show-options="isShowingOptions = true"
					@hide-options="isShowingOptions = false"
					@show-launch-options="isShowingLaunchOptions = true"
					@hide-launch-options="isShowingLaunchOptions = false"
				/>

				<span class="-version">
					<template v-if="!hasMultiplePackages">
						{{ packageVersion }}
					</template>
					<template v-else>
						<AppTranslate>Multiple Packages</AppTranslate>
					</template>
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./game.styl" scoped></style>
