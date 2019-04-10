<template>
	<app-modal :modal="modal">
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title" v-if="!collection">
				<translate>library.playlists.save_modal.add_heading</translate>
			</h2>
			<h2 class="modal-title" v-if="collection">
				<translate>library.playlists.save_modal.edit_heading</translate>
			</h2>
		</div>

		<div class="modal-body">
			<form-playlist :model="collection ? collection.playlist : undefined" @submit="onSaved" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./save-modal"></script>
