<script lang="ts" src="./feed"></script>

<template>
	<app-communities-view-page-container class="-container">
		<template #default>
			<div v-if="channel.visibility === 'draft'" class="col-md-6 col-centered">
				<app-illustration src="~img/ill/no-comments.svg">
					<translate>
						This channel is a "Draft". When it gets published, the post feed will appear
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
			<div v-if="channel.description_content">
				<app-community-channel-description :channel="channel" />
			</div>
		</template>
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped>
.-container
	padding-top: 0
</style>
