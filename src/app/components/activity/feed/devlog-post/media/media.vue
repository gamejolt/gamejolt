<template>
	<div class="devlog-post-media">
		<v-touch
			class="-lightbox"
			@panstart="panStart"
			@panmove="pan"
			@panend="panEnd"
			:pan-options="{ direction: 'horizontal' }"
		>
			<div class="-container">
				<div class="-slider" ref="slider">
					<app-media-item-post
						v-for="mediaItem of post.media"
						:key="mediaItem.id"
						:media-item="mediaItem"
						:is-post-hydrated="isHydrated"
						:is-active="getIsActiveMediaItem(mediaItem)"
						@bootstrap="onItemBootstrapped()"
						@fullscreen="onClickFullscreen"
						restrict-device-max-height
						inline
					/>
				</div>
			</div>

			<app-button class="-prev" v-if="page > 1" overlay trans @click="goPrev">
				<app-jolticon icon="chevron-left" />
			</app-button>

			<app-button class="-next" v-if="page < post.media.length" overlay trans @click="goNext">
				<app-jolticon icon="chevron-right" />
			</app-button>
		</v-touch>

		<app-event-item-media-indicator
			v-if="post.media.length > 1"
			class="-indicator"
			:count="post.media.length"
			:current="page"
		/>
	</div>
</template>

<style lang="stylus" src="./media.styl" scoped></style>

<script lang="ts" src="./media"></script>
