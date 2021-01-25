<script lang="ts" src="./overview"></script>

<template>
	<app-communities-view-page-container>
		<form-community-channel-edit :community="community" :model="channel" @submit="onSubmit" />

		<template v-if="canEditDescription && Screen.isMobile">
			<h2 class="-mobile-header">
				<translate>Edit Description</translate>
			</h2>
			<form-community-channel-description :model="channel" />
		</template>
		<template v-if="canEditDescription && !Screen.isMobile" #sidebar>
			<h2 class="section-header">
				<translate>Edit Description</translate>
			</h2>
			<form-community-channel-description :model="channel" />
		</template>

		<template v-if="channel.visibility === 'published'">
			<div class="well fill-offset -danger-zone">
				<template v-if="!channel.is_archived">
					<h4 class="sans-margin-top">
						<translate>Archive Channel</translate>
					</h4>

					<div class="page-help">
						<p>
							<translate>
								Archiving a channel will hide it from the community's channel list
								and sets it to read-only for all users. Any existing posts in the
								channel will remain there, and the channel can still be viewed.
							</translate>
						</p>
					</div>

					<app-button :disabled="!canArchive" @click="onClickArchive">
						<translate>Archive Channel</translate>
					</app-button>

					<p v-if="!canArchive" class="help-block sans-margin-bottom">
						<translate>The last public channel cannot be archived.</translate>
					</p>
				</template>

				<template v-else>
					<h4 class="sans-margin-top">
						<translate>Restore Channel</translate>
					</h4>

					<div class="page-help">
						<p>
							<translate>
								Restoring a channel will remove it from the archive and make it
								publicly visible again.
							</translate>
						</p>
					</div>

					<app-button @click="onClickUnarchive">
						<translate>Restore Channel</translate>
					</app-button>
				</template>
			</div>
		</template>
	</app-communities-view-page-container>
</template>

<style lang="stylus" scoped>
.-mobile-header
	margin-top: 32px

.-danger-zone
	margin-top: 32px
</style>
