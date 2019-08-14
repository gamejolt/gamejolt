import { GameBuild } from '../../../../_common/game/build/build.model';
import { Game } from '../../../../_common/game/game.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';

@Component({
	components: {
		AppJolticon,
	},
})
export default class AppGameCoverButtonsBuildButtons extends Vue {
	@Prop(Game) game!: Game;
	@Prop(Array) downloadableBuilds!: GameBuild[];
	@Prop(Array) browserBuilds!: GameBuild[];
	@Prop(Array) installableBuilds!: GameBuild[];
}
