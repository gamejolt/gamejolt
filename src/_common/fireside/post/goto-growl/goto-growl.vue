<template>
	<div>
		<h4 class="section-header">
			<span v-if="action === 'publish'" v-translate>
				Your post was published!
			</span>
			<span v-else-if="isActive">
				<app-jolticon icon="share-airplane" />
				<translate>Your post was added!</translate>
			</span>
			<span v-else-if="isDraft" v-translate>
				<app-jolticon icon="edit" />
				Your post was saved as a draft.
			</span>
			<span v-else v-translate>
				<app-jolticon icon="calendar-grid" />
				Your post was scheduled.
			</span>
		</h4>

		<div v-if="isScheduled">
			It's scheduled to be published automatically in
			<app-time-ago :date="post.scheduled_for" without-suffix />
			.
		</div>

		<div class="-controls">
			<router-link :to="post.routeLocation">
				<app-button @click="onClickedView">
					<translate>View Post</translate>
				</app-button>
			</router-link>
			<router-link v-if="isDraft" :to="draftsLocation">
				<app-button @click="onClickedView">
					<translate>All Drafts</translate>
				</app-button>
			</router-link>
			<router-link v-else-if="isScheduled" :to="scheduledLocation">
				<app-button @click="onClickedView">
					<translate>All Scheduled Posts</translate>
				</app-button>
			</router-link>
			<router-link v-else-if="shouldShowCommunityRedirect" :to="communityLocation">
				<app-button @click="onClickedView">
					<translate>Go to Community</translate>
				</app-button>
			</router-link>
		</div>
	</div>
</template>

<style lang="stylus" scoped>

.-controls
	margin-top: 16px

</style>

<script lang="ts" src="./goto-growl"></script>
