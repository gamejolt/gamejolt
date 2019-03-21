import { GamePlaylist } from 'game-jolt-frontend-lib/components/game-playlist/game-playlist.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component, Prop } from 'vue-property-decorator';
import FormPlaylist from '../../forms/playlist/playlist.vue';
import { GameCollection } from '../../game/collection/collection.model';

@Component({
	components: {
		AppJolticon,
		FormPlaylist,
	},
})
export default class AppGamePlaylistSaveModal extends BaseModal {
	@Prop(GameCollection) collection?: GameCollection;

	onSaved(_formModel: GamePlaylist, response: any) {
		if (this.collection) {
			this.collection.assign(response.gameCollection);
			this.modal.resolve(this.collection);
		} else {
			this.modal.resolve(new GameCollection(response.gameCollection));
		}
	}
}
