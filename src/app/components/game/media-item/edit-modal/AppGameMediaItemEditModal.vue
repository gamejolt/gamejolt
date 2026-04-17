<script lang="ts" setup>
import { computed } from 'vue';

import FormGameImage from '~app/components/forms/game/image/FormGameImage.vue';
import FormGameSketchfab from '~app/components/forms/game/sketchfab/FormGameSketchfab.vue';
import FormGameVideo from '~app/components/forms/game/video/FormGameVideo.vue';
import { GameMediaItemEditModalRemoveCallback } from '~app/components/game/media-item/edit-modal/edit-modal.service';
import { Media } from '~app/views/dashboard/games/manage/manage.store';
import AppButton from '~common/button/AppButton.vue';
import { Clipboard } from '~common/clipboard/clipboard-service';
import { Environment } from '~common/environment/environment.service';
import { GameModel } from '~common/game/game.model';
import { $removeGameScreenshot } from '~common/game/screenshot/screenshot.model';
import { $removeGameSketchfab } from '~common/game/sketchfab/sketchfab.model';
import { $removeGameVideo } from '~common/game/video/video.model';
import AppModal from '~common/modal/AppModal.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import { useModal } from '~common/modal/modal.service';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	game: GameModel;
	item: Media;
	onRemove: GameMediaItemEditModalRemoveCallback;
};

const { game, item, onRemove } = defineProps<Props>();

const modal = useModal()!;

const copyLinkTooltip = computed(() => {
	if (item.media_type === 'image') {
		return $gettext(`Copy the direct link to view this image on your game page.`);
	}

	if (item.media_type === 'video') {
		return $gettext(`Copy the direct link to view this video on your game page.`);
	}

	if (item.media_type === 'sketchfab') {
		return $gettext(`Copy the direct link to view this sketchfab model on your game page.`);
	}

	return undefined;
});

const removeText = computed(() => {
	if (item.media_type === 'image') {
		return $gettext(`Remove Image`);
	}

	if (item.media_type === 'video') {
		return $gettext(`Remove Video`);
	}

	if (item.media_type === 'sketchfab') {
		return $gettext(`Remove Sketchfab`);
	}

	return undefined;
});

async function remove() {
	let typeLabel = '';
	if (item.media_type === 'image') {
		typeLabel = $gettext('Image').toLowerCase();
	} else if (item.media_type === 'video') {
		typeLabel = $gettext('Video').toLowerCase();
	} else if (item.media_type === 'sketchfab') {
		typeLabel = $gettext('sketchfab model').toLowerCase();
	}

	const message = $gettext('Are you sure you want to remove this %{ type }?', {
		type: typeLabel,
	});

	const result = await showModalConfirm(message);
	if (!result) {
		return;
	}

	if (item.media_type === 'image') {
		await $removeGameScreenshot(item);
	} else if (item.media_type === 'video') {
		await $removeGameVideo(item);
	} else if (item.media_type === 'sketchfab') {
		await $removeGameSketchfab(item);
	}

	onRemove();
	modal.dismiss();
}

function copyLink() {
	Clipboard.copy(Environment.baseUrl + item.getUrl(game));
}

function onMediaEdited(editedItem: Media) {
	modal.resolve(editedItem);
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
		</div>
	</AppModal>
</template>
