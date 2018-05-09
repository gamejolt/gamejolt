import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./edit-modal.html';

import { BaseModal } from '../../../../../lib/gj-lib-client/components/modal/base';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { FormGameImage } from '../../../forms/game/image/image';
import { FormGameVideo } from '../../../forms/game/video/video';
import { FormGameSketchfab } from '../../../forms/game/sketchfab/sketchfab';
import { Media } from '../../../../views/dashboard/games/manage/manage.store';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppVideoEmbed } from '../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppSketchfabEmbed } from '../../../../../lib/gj-lib-client/components/sketchfab/embed/embed';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Clipboard } from '../../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { GameMediaItemEditModalRemoveCallback } from './edit-modal.service';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';

@View
@Component({
	components: {
		FormGameImage,
		FormGameVideo,
		FormGameSketchfab,
		AppVideoEmbed,
		AppSketchfabEmbed,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppGameMediaItemEditModal extends BaseModal {
	@Prop(Game) game: Game;
	@Prop(Object) item: Media;
	@Prop(Function) onRemove: GameMediaItemEditModalRemoveCallback;

	readonly Environment = Environment;
	readonly Clipboard = Clipboard;

	get copyLinkTooltip() {
		if (this.item.media_type === 'image') {
			return this.$gettext(`Copy the direct link to view this image on your game page.`);
		}

		if (this.item.media_type === 'video') {
			return this.$gettext(`Copy the direct link to view this video on your game page.`);
		}

		if (this.item.media_type === 'sketchfab') {
			return this.$gettext(
				`Copy the direct link to view this sketchfab model on your game page.`
			);
		}
	}

	get removeText() {
		if (this.item.media_type === 'image') {
			return this.$gettext(`Remove Image`);
		}

		if (this.item.media_type === 'video') {
			return this.$gettext(`Remove Video`);
		}

		if (this.item.media_type === 'sketchfab') {
			return this.$gettext(`Remove Sketchfab`);
		}
	}

	async remove() {
		let typeLabel = '';
		if (this.item.media_type === 'image') {
			typeLabel = this.$gettext('dash.games.media.image_label').toLowerCase();
		} else if (this.item.media_type === 'video') {
			typeLabel = this.$gettext('dash.games.media.video_label').toLowerCase();
		} else if (this.item.media_type === 'sketchfab') {
			typeLabel = this.$gettext('sketchfab model').toLowerCase();
		}

		/// {{ type }} contains the translated media item type (image/video/sketchfab)
		const message = this.$gettextInterpolate(
			'Are you sure you want to remove this %{ type }?',
			{
				type: typeLabel,
			}
		);

		const result = await ModalConfirm.show(message);
		if (!result) {
			return;
		}

		await this.item.$remove();

		this.onRemove();
		this.modal.dismiss();
	}

	onMediaEdited(item: Media) {
		this.modal.resolve(item);
	}
}
