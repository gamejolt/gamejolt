import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./thumbnail-modal.html';

import { FormGameThumbnail } from '../../forms/game/thumbnail/thumbnail';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { MediaItem } from '../../../../lib/gj-lib-client/components/media-item/media-item-model';

@View
@Component({
	components: {
		FormGameThumbnail,
	},
})
export default class AppGameThumbnailModal extends BaseModal {
	@Prop(Game) game: Game;

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
