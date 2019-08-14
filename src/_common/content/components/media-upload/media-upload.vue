<template>
	<div class="media-upload-container">
		<div class="media-upload">
			<img v-if="src" :src="src" class="-placeholder" />
			<app-loading v-else centered />
			<div class="-progress-container">
				<app-progress-bar
					class="-progress"
					thin
					:percent="uploadProgress * 100.0"
					:indeterminate="uploadProcessing"
					:active="uploadProcessing"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.media-upload-container
	width: 100%
	display: flex
	justify-content: center
	cursor: default

.media-upload
	padding: 10px
	position: relative
	min-width: 200px
	min-height: 120px
	max-width: 400px
	max-height: 400px
	white-space: normal

.-placeholder
	margin: auto
	max-width: 95%
	max-height: 260px
	filter: grayscale(80%) contrast(50%)
	display: block

.-progress-container
	position: absolute
	bottom: 0px
	left: 0px
	width: 100%
	margin-left: auto
	margin-right: auto
	padding-left: 10px
	padding-right: 10px
</style>

<script lang="ts" src="./media-upload"></script>
