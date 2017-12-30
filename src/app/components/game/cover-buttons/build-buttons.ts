import View from '!view!./build-buttons.html';
import { GameBuild } from 'game-jolt-frontend-lib/components/game/build/build.model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppGameCoverButtonsBuildButtons extends Vue {
	@Prop(Game) game: Game;
	@Prop(Array) downloadableBuilds: GameBuild[];
	@Prop(Array) browserBuilds: GameBuild[];
	@Prop(Array) installableBuilds: GameBuild[];
}
