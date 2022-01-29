<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/AppGameThumbnail.vue';
import AppClientGameButtons from '../../../../components/client/game-buttons/game-buttons.vue';
import { LocalDbGame } from '../../../../components/client/local-db/game/game.model';
// import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';

@Options({
	components: {
		AppGameThumbnail,
		AppClientGameButtons,
	},
})
export default class AppLibraryInstalledGame extends Vue {
	@Prop(Object)
	game!: LocalDbGame;

	// @ClientLibraryState
	// packagesByGameId!: ClientLibraryStore['packagesByGameId'];
	packagesByGameId!: any;

	// @ClientLibraryState
	// packages!: ClientLibraryStore['packages'];
	packages!: any;

	isHovering = false;
	isShowingOptions = false;
	isShowingLaunchOptions = false;

	get hasMultiplePackages() {
		return this.packagesByGameId[this.game.id].length > 1;
	}

	get packageVersion() {
		return this.packagesByGameId[this.game.id][0].release.version_number;
	}

	get isInstalling() {
		return this.packages.some(i => {
			return !!i.install_state && i.game_id === this.game.id;
		});
	}

	get isUpdating() {
		return this.packages.some(i => {
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
