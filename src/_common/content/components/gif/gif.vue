<script lang="ts" src="./gif"></script>

<template>
	<app-base-content-component
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved"
	>
		<div class="-outer content-gif">
			<app-responsive-dimensions
				ref="container"
				class="-container"
				:ratio="width / height"
				:max-width="maxWidth"
				:max-height="maxHeight"
			>
				<app-scroll-inview
					:config="InviewConfig"
					@inview="onInviewChange(true)"
					@outview="onInviewChange(false)"
				>
					<img class="-poster" :src="media.preview" />
					<app-video
						v-if="isInview && videoController"
						class="-video"
						:player="videoController"
						:should-play="shouldPlay"
					/>
				</app-scroll-inview>
			</app-responsive-dimensions>
		</div>
	</app-base-content-component>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-outer
	width: 100%
	display: flex
	flex-direction: column
	margin-bottom: $line-height-computed
	min-height: 44px // make sure the X button fits properly, usually not a problem unless the image is super wide
	align-items: center

.-container
	display: flex
	justify-content: center
	align-items: center
	rounded-corners-lg()
	overflow: hidden
	max-width: 100%
	position: relative

.-video
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	rounded-corners-lg()

.-poster
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	rounded-corners-lg()
</style>
