import { GameBuild } from '../../../../../_common/game/build/build.model';
import { Game } from '../../../../../_common/game/game.model';
import AppJolticon from '../../../../../_common/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';
import AppClientGameButtons from '../../game-buttons/game-buttons.vue';

@Component({
	components: {
		AppJolticon,
		AppClientGameButtons,
	},
})
export default class AppClientGameCoverButtons extends Vue {
	@Prop(Game) game!: Game;
	@Prop(Array) downloadableBuilds!: GameBuild[];
	@Prop(Array) browserBuilds!: GameBuild[];
	@Prop(Array) installableBuilds!: GameBuild[];

	@ClientLibraryState findActiveForGame!: ClientLibraryStore['findActiveForGame'];

	get localPackage() {
		return this.findActiveForGame(this.game.id);
	}
}
