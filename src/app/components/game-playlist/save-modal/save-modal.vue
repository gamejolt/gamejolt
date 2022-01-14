<script lang="ts">
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
</script>

<template>
	<app-modal :modal="modal">
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate v-if="!collection">library.playlists.save_modal.add_heading</translate>
				<translate v-else>library.playlists.save_modal.edit_heading</translate>
			</h2>
		</div>

		<div class="modal-body">
			<form-playlist :model="collection ? collection.playlist : undefined" @submit="onSaved" />
		</div>
	</app-modal>
</template>
