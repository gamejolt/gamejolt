<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { Realm } from '../realm-model';
import AppRealmThumbnail from '../AppRealmThumbnail.vue';
import AppRealmFollowButton from '../AppRealmFollowButton.vue';
import AppSpacer from '../../spacer/AppSpacer.vue';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { Screen } from '../../screen/screen-service';
import { RouterLink } from 'vue-router';
import AppRealmChunkPosts from './AppRealmChunkPosts.vue';
import AppRealmChunkPostsPlaceholder from './AppRealmChunkPostsPlaceholder.vue';

const CardsPerRow = 5;

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
});

const { realm } = toRefs(props);

// trackGotoCommunity() {
// 	trackGotoCommunity({
// 		source: 'communityChunk',
// 		id: this.community.id,
// 		path: this.community.path,
// 	});
// }
</script>

<template>
	<div class="-chunk">
		<div class="-header">
			<RouterLink class="-header-link" :to="realm.routeLocation">
				<div class="-thumb">
					<AppRealmThumbnail :realm="realm" />
				</div>

				<AppSpacer horizontal :scale="3" />

				<div class="-header-text">
					{{ realm.name }}
				</div>
			</RouterLink>

			<AppSpacer horizontal :scale="3" />

			<div class="-follow" :style="{ width: `calc(${100 / CardsPerRow}% - 12px)` }">
				<AppRealmFollowButton :realm="realm" block />
			</div>
		</div>

		<AppSpacer vertical :scale="4" />

		<component
			:is="Screen.isXs ? AppScrollScroller : 'div'"
			:horizontal="Screen.isXs"
			:thin="Screen.isXs"
		>
			<Suspense>
				<template #default>
					<AppRealmChunkPosts :realm="realm" :cards-per-row="CardsPerRow" />
				</template>
				<template #fallback>
					<AppRealmChunkPostsPlaceholder :cards-per-row="CardsPerRow" />
				</template>
			</Suspense>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
.-header
.-header-link
	display: flex
	align-items: center

.-header-link
	flex: auto

.-header-text
	flex: auto
	font-size: 17px
	font-weight: 700
	color: var(--theme-fg)

.-thumb
	flex: none
	width: 32px
	height: 32px

.-follow
	flex: none

.-posts
	display: flex

	.-card
		flex: auto
		min-width: 0

		@media $media-xs
			min-width: 'calc(min(40vw - %s, 60vh * (10 / 16)))' % $-card-spacing !important
</style>
