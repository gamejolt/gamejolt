import View from '!view!./package-card-meta.html';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { GamePackageCardModel } from '../../../../../lib/gj-lib-client/components/game/package/card/card.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';
import { LocalDbPackage } from '../../local-db/package/package.model';

@View
@Component({})
export class AppClientPackageCardMeta extends Vue {
	@ClientLibraryState packagesById: ClientLibraryStore['packagesById'];

	@Prop(Game) game: Game;
	@Prop(GamePackage) package: GamePackage;
	@Prop(GamePackageCardModel) card: GamePackageCardModel;

	get localPackage(): LocalDbPackage | undefined {
		return this.packagesById[this.package.id];
	}
}
