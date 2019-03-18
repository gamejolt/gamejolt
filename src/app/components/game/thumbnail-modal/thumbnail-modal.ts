import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { Component, Prop } from 'vue-property-decorator';
import FormGameThumbnail from '../../forms/game/thumbnail/thumbnail.vue';


@Component({
	components: {
		FormGameThumbnail,
	},
})
export default class AppGameThumbnailModal extends BaseModal {
	@Prop(Game) game!: Game;

	// We don't want to close the modal after they've uploaded a thumbnail since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousThumbnailId: number | null = null;

	created() {
		if (this.game.thumbnail_media_item) {
			this.previousThumbnailId = this.game.thumbnail_media_item.id;
		}
	}

	onSubmit(game: Game) {
		const newThumbnailId = (game.thumbnail_media_item && game.thumbnail_media_item.id) || null;
		if (this.previousThumbnailId === newThumbnailId) {
			this.modal.resolve(this.game);
		}
		this.previousThumbnailId = newThumbnailId;
	}
}
