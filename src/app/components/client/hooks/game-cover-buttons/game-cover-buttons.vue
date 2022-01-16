<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { Game } from '../../../../../_common/game/game.model';
import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';
import AppClientGameButtons from '../../game-buttons/game-buttons.vue';

@Options({
	components: {
		AppClientGameButtons,
	},
})
export default class AppClientGameCoverButtons extends Vue {
	@Prop(Object) game!: Game;
	@Prop(Array) downloadableBuilds!: GameBuild[];
	@Prop(Array) browserBuilds!: GameBuild[];
	@Prop(Array) installableBuilds!: GameBuild[];

	@ClientLibraryState findActiveForGame!: ClientLibraryStore['findActiveForGame'];

	@Emit('play')
	emitPlay() {}

	get localPackage() {
		return this.findActiveForGame(this.game.id);
	}
}
</script>

<template>
	<div class="client-game-cover-buttons">
		<!--
			For Client we hide this once they start installing a package or if they have something
			installed.
		-->
		<app-button
			v-if="browserBuilds.length > 0 && !localPackage"
			primary
			outline
			icon="play"
			@click="emitPlay()"
		>
			<translate>Quick Play</translate>
		</app-button>

		<!--
			Only show if there is any downloadable builds for the game. The component will show a
			tooltip saying it can't be installed for their platform if there's not an installable build.
		-->
		<app-client-game-buttons
			v-if="downloadableBuilds.length > 0"
			label="game-cover"
			:game="game"
			:can-install="installableBuilds.length > 0"
			no-progress
		/>
	</div>
</template>
