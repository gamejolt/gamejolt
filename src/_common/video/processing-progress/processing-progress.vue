<script lang="ts" src="./processing-progress"></script>

<template>
	<div>
		<app-progress-poller
			:url="`/web/posts/manage/add-video-progress/${post.id}`"
			:interval="3000"
			@progress="onProgress"
			@complete="emitComplete"
			@error="emitError"
		/>

		<app-responsive-dimensions :ratio="16 / 9">
			<div v-if="hasData" class="-preview">
				<template v-if="videoPosterImgUrl">
					<app-img-responsive
						class="-preview-img"
						:src="videoPosterImgUrl"
						:style="{
							filter: cssFilter,
						}"
					/>

					<div class="-preview-icon-container">
						<app-jolticon icon="video" big class="-poster-icon -overlay-icon" />
					</div>
				</template>
				<app-jolticon v-else icon="video" big class="-poster-icon" />
			</div>
		</app-responsive-dimensions>

		<br />
		<app-progress-bar
			:percent="progress"
			:indeterminate="isIndeterminate"
			thin
			animate
			active
		/>

		<div>
			<translate>
				Your video is currently being processed. This could take some time depending on the
				size of your video.
			</translate>
			<translate v-if="post.isActive"> We will publish your post once it's ready. </translate>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-preview
	change-bg('bg-offset')
	rounded-corners-lg()
	overflow: hidden
	position: relative
	height: 100%
	display: flex
	justify-content: center
	align-items: center

	&-img
		display: block
		position: relative
		max-width: 100%
		max-height: 100%
		transition: filter 0.5s ease

	&-icon-container
		position: absolute
		left: 0
		top: 0
		right: 0
		bottom: 0
		display: flex
		justify-content: center
		align-items: center

.-poster-icon
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1))

.-overlay-icon
	color: white
</style>
