<script lang="ts" src="./scrubber"></script>

<template>
	<v-touch
		class="audio-scrubber"
		:class="{ dragging: isDragging }"
		:pan-options="{ direction: 'horizontal', threshold: 0 }"
		@panstart="panStart"
		@panmove="pan"
		@panend="panEnd"
		@tap="tap"
		@touchmove.native="onTouchMove"
	>
		<div ref="timebar" class="audio-scrubber-timebar">
			<div class="audio-scrubber-timebar-handle" :style="{ right: unfilledRight }" />

			<div class="audio-scrubber-timebar-unfilled">
				<div class="audio-scrubber-timebar-filled" :style="{ right: unfilledRight }" />
			</div>
		</div>
	</v-touch>
</template>

<style lang="stylus" src="./scrubber.styl" scoped></style>

