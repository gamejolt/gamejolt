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
					<app-activity-feed-devlog-post-media-item
						v-for="mediaItem of post.media"
						:key="mediaItem.id"
						:media-item="mediaItem"
						:is-post-hydrated="isHydrated"
						:is-active="mediaItem === activeMediaItem"
						@bootstrap="onItemBootstrapped()"
					/>
				</div>
			</div>

			<a class="-prev" v-if="page > 1" @click.stop="prev">
				<app-jolticon icon="chevron-left" />
			</a>

			<a class="-next" v-if="page < post.media.length" @click.stop="next">
				<app-jolticon icon="chevron-right" />
			</a>
		</v-touch>

		<app-event-item-media-indicator
			v-if="post.media.length > 1"
			class="-indicator"
			:count="post.media.length"
			:current="page"
		/>
	</div>
</template>

<style src="./media.styl" scoped />

<script lang="ts" src="./media" />
