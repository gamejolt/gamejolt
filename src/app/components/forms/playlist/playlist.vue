<template>
	<app-form name="playlistForm">
		<app-form-group name="name" :label="$gettext('library.playlists.form.name_label')">
			<app-form-control
				type="text"
				:rules="{
					max: 100,
				}"
				v-app-focus-when
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate v-if="method === 'add'">Add Playlist</translate>
			<translate v-else>Save Playlist</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./playlist" />
