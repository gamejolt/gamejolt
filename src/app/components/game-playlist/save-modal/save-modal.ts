import { mixins, Options, Prop } from 'vue-property-decorator';
import { GamePlaylist } from '../../../../_common/game-playlist/game-playlist.model';
import { BaseModal } from '../../../../_common/modal/base';
import FormPlaylist from '../../forms/playlist/playlist.vue';
import { GameCollection } from '../../game/collection/collection.model';

@Options({
	components: {
		FormPlaylist,
	},
})
export default class AppGamePlaylistSaveModal extends mixins(BaseModal) {
	@Prop(Object) collection?: GameCollection;

	onSaved(_formModel: GamePlaylist, response: any) {
		if (this.collection) {
			this.collection.assign(response.gameCollection);
			this.modal.resolve(this.collection);
		} else {
			this.modal.resolve(new GameCollection(response.gameCollection));
		}
	}
}