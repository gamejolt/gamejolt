<script lang="ts" src="./feed"></script>

<template>
	<app-communities-view-page-container>
		<template #default>
			<div v-if="channel.visibility === 'draft'">
				<app-illustration src="~img/ill/no-comments.svg">
					<translate>
						This is a draft channel. When it gets published, the post feed will appear
						here.
					</translate>
				</app-illustration>
			</div>
			<app-communities-view-feed
				v-else
				:feed="feed"
				@add-post="onPostAdded"
				@load-new="loadedNew"
			/>
		</template>

		<template #sidebar>
			<app-community-competition-sidebar
				v-if="channel.type === 'competition'"
				:community="community"
				:channel="channel"
			/>
		</template>
	</app-communities-view-page-container>
</template>
