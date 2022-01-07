<script lang="ts" src="./scrubber"></script>

<template>
	<AppTouch
		class="audio-scrubber"
		:class="{ dragging: isDragging }"
		:pan-options="{ direction: 'horizontal', threshold: 0 }"
		@panstart="panStart"
		@panmove="pan"
		@panend="panEnd"
		@tap="tap"
	>
		<div ref="timebar" class="audio-scrubber-timebar">
			<div class="audio-scrubber-timebar-handle" :style="{ right: unfilledRight }" />

			<div class="audio-scrubber-timebar-unfilled">
				<div class="audio-scrubber-timebar-filled" :style="{ right: unfilledRight }" />
			</div>
		</div>
	</AppTouch>
</template>

<style lang="stylus" src="./scrubber.styl" scoped></style>
