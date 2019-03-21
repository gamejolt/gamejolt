import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GamePackageCardModel } from 'game-jolt-frontend-lib/components/game/package/card/card.model';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';
import { LocalDbPackage } from '../../local-db/package/package.model';


@Component({})
export default class AppClientPackageCardMeta extends Vue {
	@ClientLibraryState packagesById!: ClientLibraryStore['packagesById'];

	@Prop(Game) game!: Game;
	@Prop(GamePackage) package!: GamePackage;
	@Prop(GamePackageCardModel) card!: GamePackageCardModel;

	get localPackage(): LocalDbPackage | undefined {
		return this.packagesById[this.package.id];
	}
}
