<template>
	<div>
		<app-editable-overlay
			class="-fill"
			v-if="isEditing && routeStore.canEditMedia"
			@click="showEditAvatar()"
		>
			<translate slot="overlay">Change</translate>
			<app-media-item-backdrop :media-item="community.thumbnail">
				<app-community-thumbnail-img :community="community" />
			</app-media-item-backdrop>
		</app-editable-overlay>
		<router-link v-else :to="community.routeLocation">
			<app-media-item-backdrop :media-item="community.thumbnail">
				<app-community-thumbnail-img :community="community" />
			</app-media-item-backdrop>
		</router-link>
	</div>
</template>

<script lang="ts" src="./editable-thumbnail"></script>
