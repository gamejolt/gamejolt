import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./game-cover-buttons.html';

import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';
import { AppClientGameButtons } from '../../game-buttons/game-buttons';

@View
@Component({
	components: {
		AppJolticon,
		AppClientGameButtons,
	},
})
export class AppClientGameCoverButtons extends Vue {
	@Prop(Game) game!: Game;
	@Prop(Array) downloadableBuilds!: GameBuild[];
	@Prop(Array) browserBuilds!: GameBuild[];
	@Prop(Array) installableBuilds!: GameBuild[];

	@ClientLibraryState findActiveForGame!: ClientLibraryStore['findActiveForGame'];

	get localPackage() {
		return this.findActiveForGame(this.game.id);
	}
}
