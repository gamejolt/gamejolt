<script lang="ts" src="./thumbnail"></script>

<template>
	<router-link v-app-track-event="event" class="tag-thumbnail" :class="{ active }" :to="location">
		<div class="-ratio">
			<div class="-content">
				<img class="-image" :src="tagInfo.image" alt="" />
				<div class="-info">
					<div class="-label">
						{{ tagInfo.label }}
					</div>
				</div>
			</div>
		</div>
	</router-link>
</template>

<style lang="stylus" scoped>
.tag-thumbnail
	display: block
	margin-bottom: $line-height-computed

	// Looks weird on mobile devices.
	@media $media-md-up
		&:hover .-info
			theme-prop('color', 'highlight')

	&.active .-info
		theme-prop('color', 'highlight')

.-ratio
	rounded-corners-lg()
	change-bg('darkest')
	position: relative
	height: 0
	padding-top: 100% // Makes it same height as width.
	overflow: hidden

.-content
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	flex-direction: column
	align-items: center
	justify-content: space-evenly

.-image
	width: 116px * 0.5
	height: 116px * 0.5

.-info
	padding: 8px 0
	color: $white
	font-size: $font-size-small

.-label
	font-weight: bold
	text-align: center
</style>
