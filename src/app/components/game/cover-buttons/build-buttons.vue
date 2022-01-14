<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { GameBuild } from '../../../../_common/game/build/build.model';
import { Game } from '../../../../_common/game/game.model';

@Options({})
export default class AppGameCoverButtonsBuildButtons extends Vue {
	@Prop(Object) game!: Game;
	@Prop(Array) downloadableBuilds!: GameBuild[];
	@Prop(Array) browserBuilds!: GameBuild[];
	@Prop(Array) installableBuilds!: GameBuild[];

	@Emit('play')
	emitPlay() {}

	@Emit('download')
	emitDownload() {}
}
</script>

<template>
	<div>
		<app-button v-if="browserBuilds.length" primary solid icon="play" @click="emitPlay()">
			<translate>Play Game</translate>
		</app-button>

		<app-button
			v-if="downloadableBuilds.length"
			primary
			:solid="!browserBuilds.length"
			icon="download"
			@click="emitDownload()"
		>
			<translate>Download</translate>
		</app-button>
	</div>
</template>
