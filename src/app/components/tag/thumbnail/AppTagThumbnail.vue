<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { TagsInfo } from '~app/components/tag/tags-info.service';
import { RouteLocationDefinition } from '~utils/router';

type Props = {
	tag: string;
	eventCat?: string;
};

const { tag, eventCat: _eventCat = 'global' } = defineProps<Props>();

const route = useRoute();

const tagInfo = computed(() => {
	return TagsInfo.tags.find(i => i.id === tag)!;
});

const location = computed((): RouteLocationDefinition => {
	return {
		name: 'discover.games.list._fetch-tag',
		params: {
			section: route.params.section || (null as any),
			tag: tag,
		},
		query: Object.assign({}, route.query, { page: undefined }),
	};
});

const active = computed(() => {
	return route.name === 'discover.games.list._fetch-tag' && route.params.tag === tag;
});
</script>

<template>
	<router-link class="tag-thumbnail" :class="{ active }" :to="location">
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

	&:hover
		.-image
			animation-name: anim-image-hover
			animation-duration: 0.2s
			animation-timing-function: ease-out
			animation-fill-mode: forwards
			animation-iteration-count: 1

.-ratio
	rounded-corners-lg()
	change-bg('darkest')
	position: relative
	height: 0
	padding-top: 100% // Makes it same height as width.

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

@keyframes anim-image-hover
	0%
		transform: none
	50%
		transform: scaleX(0.75) scaleY(1.2) translateY(-8px)
	100%
		transform: none

.-info
	padding: 8px 0
	color: $white
	font-size: $font-size-small

.-label
	font-weight: bold
	text-align: center
</style>
