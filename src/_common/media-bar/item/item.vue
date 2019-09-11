<template>
	<div class="media-bar-item" :style="{ width, height }">
		<a class="-wrapper">
			<slot />

			<app-img-responsive
				v-if="item.media_type !== 'sketchfab'"
				:src="item.img_thumbnail"
				:title="item.media_type == 'image' ? item.caption : item.title"
				alt=""
			/>

			<img v-else class="img-responsive" :src="item.img_thumbnail" alt="" />

			<span class="-play" v-if="item.media_type === 'video'">
				<app-jolticon icon="play" />
			</span>

			<span class="-play" v-if="item.media_type === 'sketchfab'">
				<app-jolticon icon="sketchfab" />
			</span>
		</a>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>

<script lang="ts" src="./item"></script>
