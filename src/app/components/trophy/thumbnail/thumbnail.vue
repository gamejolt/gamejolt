<template>
	<div
		class="trophy-thumbnail"
		:class="{
			'trophy-thumbnail-achieved': this.trophy.is_achieved && !this.noHighlight,
		}"
		v-app-tooltip="tooltip"
	>
		<div class="trophy-thumbnail-img" ref="thumb">
			<div class="trophy-thumbnail-img-inner">
				<app-img-responsive v-if="hasThumbnailImg" :src="imgSrc" />
				<img
					v-else
					:class="`trophy-thumbnail-img-${imgMultiplier}x`"
					:style="{
						width: imgWidth + 'px',
						height: imgHeight + 'px',
					}"
					:src="imgSrc"
				/>
			</div>
		</div>

		<span v-if="!noDifficulty" class="trophy-thumbnail-difficulty">
			{{ trophy.difficultyLabel }}
		</span>
	</div>
</template>

<style lang="stylus" src="./thumbnail.styl" scoped></style>

<script lang="ts" src="./thumbnail"></script>
