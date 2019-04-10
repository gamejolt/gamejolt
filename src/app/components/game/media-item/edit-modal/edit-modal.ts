import { Clipboard } from 'game-jolt-frontend-lib/components/clipboard/clipboard-service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import AppSketchfabEmbed from 'game-jolt-frontend-lib/components/sketchfab/embed/embed.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppVideoEmbed from 'game-jolt-frontend-lib/components/video/embed/embed.vue';
import { Component, Prop } from 'vue-property-decorator';
import { Media } from '../../../../views/dashboard/games/manage/manage.store';
import FormGameImage from '../../../forms/game/image/image.vue';
import FormGameSketchfab from '../../../forms/game/sketchfab/sketchfab.vue';
import FormGameVideo from '../../../forms/game/video/video.vue';
import { GameMediaItemEditModalRemoveCallback } from './edit-modal.service';


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
	@Prop(Game) game!: Game;
	@Prop(Object) item!: Media;
	@Prop(Function) onRemove!: GameMediaItemEditModalRemoveCallback;

	get copyLinkTooltip() {
		if (this.item.media_type === 'image') {
			return this.$gettext(`Copy the direct link to view this image on your game page.`);
		}

		if (this.item.media_type === 'video') {
			return this.$gettext(`Copy the direct link to view this video on your game page.`);
		}

		if (this.item.media_type === 'sketchfab') {
			return this.$gettext(`Copy the direct link to view this sketchfab model on your game page.`);
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
		const message = this.$gettextInterpolate('Are you sure you want to remove this %{ type }?', {
			type: typeLabel,
		});

		const result = await ModalConfirm.show(message);
		if (!result) {
			return;
		}

		await this.item.$remove();

		this.onRemove();
		this.modal.dismiss();
	}

	copyLink() {
		Clipboard.copy(Environment.baseUrl + this.item.getUrl(this.game));
	}

	onMediaEdited(item: Media) {
		this.modal.resolve(item);
	}
}
