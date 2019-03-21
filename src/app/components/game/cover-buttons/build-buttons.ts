import { GameBuild } from 'game-jolt-frontend-lib/components/game/build/build.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue'

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
