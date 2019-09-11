import { Game } from '../../../../../_common/game/game.model';
import { GamePackageCardModel } from '../../../../../_common/game/package/card/card.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
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
