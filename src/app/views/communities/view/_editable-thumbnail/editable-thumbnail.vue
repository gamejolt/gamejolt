<script lang="ts" src="./editable-thumbnail"></script>

<template>
	<div>
		<app-editable-overlay v-if="canEdit" class="-fill" @click="showEditAvatar()">
			<template #overlay>
				<translate>Change</translate>
			</template>
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
