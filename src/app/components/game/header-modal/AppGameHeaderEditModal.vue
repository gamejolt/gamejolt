<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { GameModel } from '../../../../_common/game/game.model';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import FormGameHeader from '../../forms/game/header/header.vue';

type Props = {
	game: GameModel;
};

const { game } = defineProps<Props>();

const modal = useModal()!;

// We don't want to close the modal after they've uploaded a header since they can set a crop
// after. We want to auto-close it after they've saved the crop, though.
const previousHeaderId = ref<number | null>(null);

onMounted(() => {
	if (game.header_media_item) {
		previousHeaderId.value = game.header_media_item.id;
	}
});

function onSubmit(updatedGame: GameModel) {
	const newHeaderId = (updatedGame.header_media_item && updatedGame.header_media_item.id) || null;
	if (previousHeaderId.value === newHeaderId) {
		modal.resolve(game);
	}
	previousHeaderId.value = newHeaderId;
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-body">
			<FormGameHeader :model="game" @submit="onSubmit" />
		</div>
	</AppModal>
</template>