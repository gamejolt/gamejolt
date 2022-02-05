<script lang="ts" setup>
import { PropType, ref, toRefs } from 'vue';
import { EventItem } from '../../event-item/event-item.model';
import { Realm } from '../realm-model';
import AppSpacer from '../../spacer/AppSpacer.vue';
import AppPostCard from '../../fireside/post/card/AppPostCard.vue';
import { Api } from '../../api/api.service';
import AppTranslate from '../../translate/AppTranslate.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/AppScrollScroller.vue';
import { HistoryCache } from '../../history/cache/cache.service';
import { useRoute } from 'vue-router';

const props = defineProps({
	realm: {
		type: Object as PropType<Realm>,
		required: true,
	},
	cardsPerRow: {
		type: Number,
		required: true,
	},
});

const { realm } = toRefs(props);
const route = useRoute();

const cacheKey = `realm-chunk-${realm.value.id}`;

const payload =
	HistoryCache.get(route, cacheKey) ??
	(await Api.sendRequest(
		`/web/posts/fetch/realm/${realm.value.path}?perPage=5`,
		{},
		{ detach: true }
	));

HistoryCache.store(route, payload, cacheKey);

const items = ref(EventItem.populate<EventItem>(payload.items));
</script>

<template>
	<component
		:is="Screen.isXs ? AppScrollScroller : 'div'"
		:horizontal="Screen.isXs"
		:thin="Screen.isXs"
		:class="{ '-scroller': Screen.isXs }"
	>
		<div class="-posts">
			<AppSpacer horizontal :scale-xs="4" />

			<template v-for="num of cardsPerRow" :key="num">
				<AppSpacer v-if="num > 1" horizontal :scale="4" />

				<div class="-card">
					<template v-if="items[num - 1]">
						<AppPostCard
							:post="items[num - 1].action"
							source="realmChunk"
							with-user
							:link-to="num === items.length ? realm.routeLocation : undefined"
						>
							<template v-if="num === items.length" #overlay>
								<div class="-overlay">
									<AppTranslate>See more in this realm</AppTranslate>
								</div>
							</template>
						</AppPostCard>
					</template>
				</div>
			</template>

			<AppSpacer horizontal :scale-xs="4" />
		</div>
	</component>
</template>

<style lang="stylus" src="./common.styl" scoped></style>

<style lang="stylus" scoped>
.-scroller
	margin-left: -($grid-gutter-width-xs * 0.5)
	margin-right: -($grid-gutter-width-xs * 0.5)

.-overlay
	width: 75px
</style>
