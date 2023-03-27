<script lang="ts">
import { computed, ref, Ref } from 'vue';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppCollectible from '../../../../_common/inventory/AppCollectible.vue';
import { InventoryCollectible } from '../../../../_common/inventory/collectible.model';
import {
	COLLECTION_TYPE_GAME,
	COLLECTION_TYPE_GAMEJOLT,
	COLLECTION_TYPE_USER,
	InventoryCollection,
} from '../../../../_common/inventory/collection.model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import AppProgressBarQuest from '../../../../_common/quest/AppQuestProgress.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { routeCollections } from '../collections.route';
import { useCollectionsRouteStore } from '../collections.store';
import { getRouteResolver } from '../RouteCollections.vue';

export default {
	...defineAppRouteOptions({
		deps: { params: ['username', 'collectionId'] },
		resolver: ({ route }) =>
			getRouteResolver(route, `view/:username/${route.params.collectionId}`),
	}),
	components: {
		AppSpacer,
		AppCollectible,
		AppMediaItemBackdrop,
		AppImgResponsive,
		AppJolticon,
	},
};
</script>

<script lang="ts" setup>
const collection = ref<InventoryCollection>();
const collectibles = ref([]) as Ref<InventoryCollectible[]>;
const canViewMe = ref<boolean>(false);
const { viewingCollection } = useCollectionsRouteStore();

const routeTitle = computed(() => collection.value?.name || $gettext(`Browse Collection`));

createAppRoute({
	routeTitle,
	onResolved: ({ payload }) => {
		collection.value = new InventoryCollection(payload.collection);
		collectibles.value = InventoryCollectible.populate(payload.collectibles);
		canViewMe.value = payload.canViewMe;

		viewingCollection.value = collection.value;
	},
});

const collectionType = computed(() => {
	if (!collection.value) {
		return '';
	}

	switch (collection.value.type) {
		case COLLECTION_TYPE_GAMEJOLT:
			return $gettext(`Game Jolt Collection`);
		case COLLECTION_TYPE_GAME:
			return $gettext(`Game Collection`);
		case COLLECTION_TYPE_USER:
			return $gettext(`Creator Collection`);
	}

	// Fallback.
	return collection.value.type;
});

const collectionUnlockProgress = computed(() => {
	if (!collectibles.value) {
		return 0;
	}

	return collectibles.value.filter(x => x.is_unlocked).length;
});

const collectedAll = computed(() => collectionUnlockProgress.value === collectibles.value.length);

// Save animation cost on mobile device, or if there are too many collectibles.
const doCollectibleAnimation = computed(() => !Screen.isMobile && collectibles.value.length <= 16);
</script>

<template>
	<div v-if="collection" class="_view">
		<div class="_header-container">
			<AppMediaItemBackdrop
				v-if="collection.header_media_item"
				class="_header anim-fade-in-down"
				:media-item="collection.header_media_item"
			>
				<AppImgResponsive
					class="_header-img"
					:src="collection.header_media_item.mediaserver_url"
					:style="{
						width: `calc(150px * (1 / ${collection.header_media_item.aspectRatio}))`,
					}"
				/>
			</AppMediaItemBackdrop>
			<template v-else-if="Screen.isMobile">
				<!-- Add small padding to the top so the Back button below does not overlap with the content below it. -->
				<AppSpacer vertical :scale="12" />
			</template>

			<template v-if="Screen.isMobile">
				<div class="_header-shadow" />
				<RouterLink
					class="_back-btn"
					:to="{
						name: routeCollections.name,
					}"
				>
					<AppJolticon icon="chevron-left" />
					<AppSpacer horizontal :scale="1" />
					{{ $gettext(`Browse Collections`) }}
				</RouterLink>
			</template>
		</div>

		<div class="container">
			<section class="section section-thin">
				<div class="text-center">
					<div class="_collection-type">{{ collectionType }}</div>
					<div class="_collection-name">{{ collection.name }}</div>
					<!-- TODO: timeframe, if set -->
					<!-- <template v-if="quest.ends_on">
						<AppQuestTimer :date="quest.ends_on" />
					</template> -->
				</div>
				<AppSpacer vertical :scale="4" />

				<div v-if="collection.description">
					{{ collection.description }}
					<AppSpacer vertical :scale="4" />
				</div>

				<AppProgressBarQuest
					:progress="collectionUnlockProgress"
					is-percent
					:max-progress-ticks="collectibles.length"
					show-end-display
					:icon="collectedAll ? 'star' : undefined"
				/>
			</section>

			<section class="section">
				<div v-if="collectibles" class="_collectibles">
					<AppCollectible
						v-for="collectible of collectibles"
						:key="collectible.id"
						class="stagger-fast"
						:class="{ 'anim-fade-in-up': doCollectibleAnimation }"
						:collectible="collectible"
					/>
				</div>
			</section>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-header-height = 150px
$-font-size = $font-size-small

._view
	display: flex
	flex-direction: column
	height: 100%

._header-container
	position: relative

._header
	width: 100%
	height: $-header-height
	display: flex
	justify-content: center
	align-items: center
	change-bg('bg-offset')

	@media $media-mobile
		height: $-header-height * 0.65

._header-img
	position: absolute
	min-width: 100%
	min-height: 100%
	object-fit: cover
	max-width: unset

._header-shadow
	background-image: linear-gradient(to bottom, rgba(black, 0.5), transparent)
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0

._back-btn
	overlay-text-shadow()
	position: absolute
	left: 8px
	top: 8px
	display: inline-flex
	align-items: center
	color: white
	font-size: $font-size-large
	font-weight: 700

	.jolticon
		font-size: 24px

._collection-name
	font-family: 'Germania'
	font-size: 28px

._collection-type
	font-size: $-font-size
	text-transform: uppercase
	color: var(--theme-fg-muted)

._collectibles
	display: flex
	flex-wrap: wrap
	justify-content: center
	gap: 16px

	@media $media-md-up
		gap: 32px
</style>
