import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./game.html?style=./game.styl';

import { LocalDbGame } from '../../../../components/client/local-db/game/game.model';
import { AppGameThumbnail } from '../../../../components/game/thumbnail/thumbnail';
import { AppClientGameButtons } from '../../../../components/client/game-buttons/game-buttons';
import { Store } from '../../../../store/index';

@View
@Component({
	components: {
		AppGameThumbnail,
		AppClientGameButtons,
	},
})
export class AppLibraryInstalledGame extends Vue {
	@Prop(LocalDbGame) game: LocalDbGame;

	@State clientLibrary: Store['clientLibrary'];

	isHovering = false;
	isShowingOptions = false;
	isShowingLaunchOptions = false;

	get hasMultiplePackages() {
		return this.clientLibrary.packagesByGameId[this.game.id].length > 1;
	}

	get packageVersion() {
		return this.clientLibrary.packagesByGameId[this.game.id][0].release.version_number;
	}

	get isInstalling() {
		return this.clientLibrary.packages.some(i => {
			return !!i.install_state && i.game_id === this.game.id;
		});
	}

	get isUpdating() {
		return this.clientLibrary.packages.some(i => {
			return !!i.update_state && i.game_id === this.game.id;
		});
	}

	get shouldShowControls() {
		return (
			this.isHovering ||
			this.isShowingOptions ||
			this.isShowingLaunchOptions ||
			this.isInstalling ||
			this.isUpdating
		);
	}
}
