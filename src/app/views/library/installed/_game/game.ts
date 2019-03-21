import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/thumbnail.vue';
import AppClientGameButtons from '../../../../components/client/game-buttons/game-buttons.vue';
import { LocalDbGame } from '../../../../components/client/local-db/game/game.model';
import { ClientLibraryState, ClientLibraryStore } from '../../../../store/client-library';

@Component({
	components: {
		AppGameThumbnail,
		AppClientGameButtons,
	},
})
export default class AppLibraryInstalledGame extends Vue {
	@Prop(LocalDbGame)
	game!: LocalDbGame;

	@ClientLibraryState
	packagesByGameId!: ClientLibraryStore['packagesByGameId'];

	@ClientLibraryState
	packages!: ClientLibraryStore['packages'];

	isHovering = false;
	isShowingOptions = false;
	isShowingLaunchOptions = false;

	get hasMultiplePackages() {
		return this.packagesByGameId[this.game.id].length > 1;
	}

	get packageVersion() {
		return this.packagesByGameId[this.game.id][0].release.version_number;
	}

	get isInstalling() {
		return this.packages.some(i => {
			return !!i.install_state && i.game_id === this.game.id;
		});
	}

	get isUpdating() {
		return this.packages.some(i => {
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
