<template>
	<v-touch
		class="audio-scrubber"
		:class="{ dragging: isDragging }"
		@panstart="panStart"
		@panmove="pan"
		@panend="panEnd"
		@tap="tap"
		:pan-options="{ direction: 'horizontal', threshold: 0 }"
	>
		<div class="audio-scrubber-timebar" ref="timebar">
			<div class="audio-scrubber-timebar-handle" :style="{ right: unfilledRight }"></div>

			<div class="audio-scrubber-timebar-unfilled">
				<div class="audio-scrubber-timebar-filled" :style="{ right: unfilledRight }"></div>
			</div>
		</div>
	</v-touch>
</template>

<style lang="stylus" src="./scrubber.styl" scoped></style>

<script lang="ts" src="./scrubber"></script>
