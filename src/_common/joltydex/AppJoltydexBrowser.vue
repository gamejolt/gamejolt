<script lang="ts" setup>
import { computed, ref } from 'vue';

import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '~common/button/AppButton.vue';
import AppCollectibleThumb from '~common/collectible/AppCollectibleThumb.vue';
import { CollectibleType } from '~common/collectible/collectible.model';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illExtremeSadness } from '~common/illustration/illustrations';
import { applyPayloadToJoltydexFeed, loadJoltydexFeed, makeJoltydexFeed } from '~common/joltydex/joltydex-feed';
import AppCircularProgress from '~common/progress/AppCircularProgress.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { useCommonStore } from '~common/store/common-store';
import { kThemePlaceholderBg } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { UserModel } from '~common/user/user.model';
import { styleFlexCenter } from '~styles/mixins';
import { kBorderRadiusLg, kFontFamilyDisplay } from '~styles/variables';

type Props = {
	user: UserModel;
};
const { user } = defineProps<Props>();
const { user: loggedInUser } = useCommonStore();

const ItemsPerPage = 24;
const isInitializing = ref(true);

const feedTypes = [
	CollectibleType.AvatarFrame,
	CollectibleType.Background,
	CollectibleType.Sticker,
];

const feedLabels = {
	[CollectibleType.AvatarFrame]: $gettext(`Avatar frames`),
	[CollectibleType.Background]: $gettext(`Backgrounds`),
	[CollectibleType.Sticker]: $gettext(`Stickers`),
};

// The number of feeds themselves are constant, no need to make the map a ref.
const feeds = new Map(feedTypes.map(type => [type, makeJoltydexFeed(type)]));

const filteredFeeds = computed(() =>
	Array.from(feeds).filter(([_type, { count }]) => count.value > 0)
);

init();

async function init() {
	try {
		const payload = await loadJoltydexFeed({
			types: feedTypes,
			ownerUser: user,
			user: loggedInUser.value!,
			perPage: ItemsPerPage,
		});

		for (const [_type, feed] of feeds) {
			applyPayloadToJoltydexFeed(payload, feed);
		}
	} catch (e) {
		console.error('Failed to load collection data', e);
	}
	isInitializing.value = false;
}

async function loadMore(type: CollectibleType) {
	const feed = feeds.get(type)!;
	feed.isLoading.value = true;

	try {
		const payload = await loadJoltydexFeed({
			types: feedTypes,
			ownerUser: user,
			user: loggedInUser.value!,
			pos: feed.collectibles.value.length,
			perPage: ItemsPerPage,
		});

		applyPayloadToJoltydexFeed(payload, feed);
	} catch (e) {
		console.error('Failed to load collection data', e);
	}

	feed.isLoading.value = false;
}

const gridStyles = {
	display: `grid`,
	gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`,
	gridGap: `8px`,
};
</script>

<template>
	<template v-if="isInitializing">
		<div :style="gridStyles">
			<AppAspectRatio
				v-for="i of 3"
				:key="i"
				:ratio="1"
				:style="{ backgroundColor: kThemePlaceholderBg, borderRadius: kBorderRadiusLg.px }"
			>
				<div
					v-if="i === 1"
					:style="[
						styleFlexCenter(),
						{
							width: `100%`,
							height: `100%`,
						},
					]"
				>
					<AppCircularProgress :style="{ width: `32px`, height: `32px` }" />
				</div>
			</AppAspectRatio>
		</div>
	</template>
	<template v-else-if="!filteredFeeds.length">
		<AppIllustration :asset="illExtremeSadness">
			{{ $gettext(`There's nothing available from this creator yet. Let them know!`) }}
		</AppIllustration>
	</template>
	<template v-else>
		<template v-for="[feedType, feed] of filteredFeeds" :key="feedType">
			<h2
				:style="{
					marginTop: `0`,
					fontFamily: kFontFamilyDisplay,
				}"
			>
				{{ feedLabels[feedType] }}
			</h2>

			<div :style="gridStyles">
				<AppCollectibleThumb
					v-for="(collectible, i) of feed.collectibles.value"
					:key="collectible.id"
					:collectible="collectible"
					:feed="feed"
					class="anim-fade-in-enlarge"
					:style="{
						animationDelay: `${15 * (i % ItemsPerPage)}ms`,
					}"
				/>
			</div>

			<AppSpacer vertical :scale="6" />

			<div v-if="!feed.reachedEnd.value" class="page-cut">
				<AppButton :disabled="feed.isLoading.value" @click="loadMore(feedType)">
					{{ feed.isLoading.value ? $gettext(`Loading...`) : $gettext(`Load more`) }}
				</AppButton>
			</div>

			<AppSpacer vertical :scale="10" />
		</template>
	</template>
</template>
