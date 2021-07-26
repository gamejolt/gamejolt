<script lang="ts" src="./save-progress"></script>

<template>
	<div>
		<div>
			<app-progress-bar
				class="-bar"
				:indeterminate="isIndeterminate"
				:percent="progress * 100"
				thin
				active
			/>
		</div>
		<template v-if="post.status === 'active'">
			<translate>
				Your post is being processed and will be published once it's ready
			</translate>
		</template>
		<template v-else>
			<translate>Parts of your post are being processed</translate>
		</template>
		<app-progress-poller
			:url="`/web/posts/manage/save-post-progress/${post.id}`"
			:interval="2000"
			@progress="onProgress"
			@complete="onComplete"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.-bar
	margin-bottom: 4px
</style>
