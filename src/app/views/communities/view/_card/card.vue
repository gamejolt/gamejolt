<template>
	<app-community-card-base :community="community">
		<template #thumbnail>
			<app-editable-overlay
				class="-fill"
				v-if="isEditing && canEditMedia"
				@click="showEditAvatar()"
			>
				<translate slot="overlay">Change</translate>
				<app-media-item-backdrop :media-item="community.thumbnail">
					<app-community-thumbnail-img :community="community" />
				</app-media-item-backdrop>
			</app-editable-overlay>
			<app-media-item-backdrop v-else :media-item="community.thumbnail">
				<app-community-thumbnail-img :community="community" />
			</app-media-item-backdrop>
		</template>
	</app-community-card-base>
</template>

<script lang="ts" src="./card"></script>
