<script lang="ts" src="./card"></script>

<template>
	<app-community-card-base :community="community" :elevate="elevate" :allow-edit="allowEdit">
		<template #thumbnail>
			<router-link :to="community.routeLocation">
				<app-media-item-backdrop :media-item="community.thumbnail">
					<app-community-thumbnail-img :community="community" />
				</app-media-item-backdrop>
			</router-link>
		</template>
	</app-community-card-base>
</template>
