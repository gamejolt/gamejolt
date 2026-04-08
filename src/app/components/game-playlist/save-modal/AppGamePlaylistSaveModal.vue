<script lang="ts" setup>
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { GamePlaylistModel } from '../../../../_common/game-playlist/game-playlist.model';
import { useModal } from '../../../../_common/modal/modal.service';
import FormPlaylist from '../../forms/playlist/FormPlaylist.vue';
import { GameCollectionModel } from '../../game/collection/collection.model';

type Props = {
	collection?: GameCollectionModel;
};

const { collection } = defineProps<Props>();

const modal = useModal()!;

function onSaved(_formModel: GamePlaylistModel, response: any) {
	if (collection) {
		collection.assign(response.gameCollection);
		modal.resolve(collection);
	} else {
		modal.resolve(new GameCollectionModel(response.gameCollection));
	}
}
</script>

<template>
	<AppModal :modal="modal">
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate v-if="!collection">Add Playlist</AppTranslate>
				<AppTranslate v-else>Edit Playlist</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<FormPlaylist :model="collection ? collection.playlist : undefined" @submit="onSaved" />
		</div>
	</AppModal>
</template>
