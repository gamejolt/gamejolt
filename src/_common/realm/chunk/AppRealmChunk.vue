<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { Realm } from '../realm-model';
import AppRealmThumbnail from '../AppRealmThumbnail.vue';
import AppRealmFollowButton from '../AppRealmFollowButton.vue';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { RouterLink } from 'vue-router';
import AppRealmChunkPosts from './AppRealmChunkPosts.vue';
import AppRealmChunkPostsPlaceholder from './AppRealmChunkPostsPlaceholder.vue';
import { trackGotoRealm } from '../../analytics/analytics.service';

const CardsPerRow = 5;

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
});

const { realm } = toRefs(props);

// @ts-expect-error unused variable
const followWidth = computed(() => `${100 / CardsPerRow}%`);
</script>

<template>
	<div class="-chunk">
		<div class="-header">
			<RouterLink
				class="-header-link"
				:to="realm.routeLocation"
				@click="trackGotoRealm({ path: realm.path, source: 'realmChunk' })"
			>
				<div class="-thumb">
					<AppRealmThumbnail :realm="realm" />
				</div>

				<AppSpacer horizontal :scale="3" />

				<div class="-header-text">
					{{ realm.name }}
				</div>
			</RouterLink>

			<AppSpacer horizontal :scale="3" />

			<div class="-follow">
				<AppRealmFollowButton :realm="realm" source="realmChunk" block />
			</div>
		</div>

		<AppSpacer vertical :scale="4" />

		<Suspense>
			<template #default>
				<AppRealmChunkPosts :realm="realm" :cards-per-row="CardsPerRow" />
			</template>
			<template #fallback>
				<AppRealmChunkPostsPlaceholder :cards-per-row="CardsPerRow" />
			</template>
		</Suspense>
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

	@media $media-sm-up
		width: calc(v-bind('followWidth') - 12px)
</style>
