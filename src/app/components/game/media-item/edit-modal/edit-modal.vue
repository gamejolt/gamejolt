<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Clipboard } from '../../../../../_common/clipboard/clipboard-service';
import { Environment } from '../../../../../_common/environment/environment.service';
import { GameModel } from '../../../../../_common/game/game.model';
import { BaseModal } from '../../../../../_common/modal/base';
import { showModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { Media } from '../../../../views/dashboard/games/manage/manage.store';
import FormGameImage from '../../../forms/game/image/image.vue';
import FormGameSketchfab from '../../../forms/game/sketchfab/sketchfab.vue';
import FormGameVideo from '../../../forms/game/video/video.vue';
import { GameMediaItemEditModalRemoveCallback } from './edit-modal.service';

@Options({
	components: {
		FormGameImage,
		FormGameVideo,
		FormGameSketchfab,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppGameMediaItemEditModal extends mixins(BaseModal) {
	@Prop(Object) game!: GameModel;
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
			return this.$gettext(
				`Copy the direct link to view this sketchfab model on your game page.`
			);
		}

		return undefined;
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

		return undefined;
	}

	async remove() {
		let typeLabel = '';
		if (this.item.media_type === 'image') {
			typeLabel = this.$gettext('Image').toLowerCase();
		} else if (this.item.media_type === 'video') {
			typeLabel = this.$gettext('Video').toLowerCase();
		} else if (this.item.media_type === 'sketchfab') {
			typeLabel = this.$gettext('sketchfab model').toLowerCase();
		}

		// {{ type }} contains the translated media item type (image/video/sketchfab)
		const message = this.$gettext('Are you sure you want to remove this %{ type }?', {
			type: typeLabel,
		});

		const result = await showModalConfirm(message);
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
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton trans @click="remove()">
				{{ removeText }}
			</AppButton>

			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<!-- <div class="row"> -->
			<!-- <div class="col-sm-4">
				<br>

				<AppButton
					block
					trans
					@click.stop="Clipboard.copy( Environment.baseUrl + item.getUrl( game ) )"
					v-app-tooltip="copyLinkTooltip"
					>
					<AppTranslate>Copy Link</AppTranslate>
				</AppButton>

				<AppButton
					block
					trans
					@click="remove()"
					>
					{{ removeText }}
				</AppButton>
			</div> -->
			<!-- <div class="col-sm-8"> -->
			<FormGameImage
				v-if="item.media_type === 'image'"
				:game="game"
				:model="item"
				@submit="onMediaEdited"
			/>

			<FormGameVideo
				v-else-if="item.media_type === 'video'"
				:game="game"
				:model="item"
				@submit="onMediaEdited"
			/>

			<FormGameSketchfab
				v-else-if="item.media_type === 'sketchfab'"
				:game="game"
				:model="item"
				@submit="onMediaEdited"
			/>

			<hr />

			<p class="text-right">
				<AppButton v-app-tooltip="copyLinkTooltip" trans @click.stop="copyLink()">
					<AppTranslate>Copy Link</AppTranslate>
				</AppButton>
			</p>

			<template v-if="item.media_type === 'image'">
				<div class="text-center">
					<img
						class="img-responsive img-rounded"
						:src="item.media_item.img_url"
						:alt="item.caption"
					/>
				</div>
			</template>
			<!-- </div> -->
			<!-- </div> -->
		</div>
	</AppModal>
</template>
