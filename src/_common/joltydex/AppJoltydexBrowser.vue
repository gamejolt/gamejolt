<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import { kFontFamilyDisplay } from '../../_styles/variables';
import AppButton from '../button/AppButton.vue';
import AppCollectibleThumb from '../collectible/AppCollectibleThumb.vue';
import { CollectibleType } from '../collectible/collectible.model';
import AppSpacer from '../spacer/AppSpacer.vue';
import { useCommonStore } from '../store/common-store';
import { $gettext } from '../translate/translate.service';
import { UserModel } from '../user/user.model';
import { applyPayloadToJoltydexFeed, loadJoltydexFeed, makeJoltydexFeed } from './joltydex-feed';

const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
});

const { user } = toRefs(props);
const { user: loggedInUser } = useCommonStore();

const isBrowserLoading = ref(false);

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
	if (isBrowserLoading.value) {
		return;
	}
	isBrowserLoading.value = true;

	try {
		const payload = await loadJoltydexFeed({
			types: feedTypes,
			ownerUser: user.value,
			user: loggedInUser.value!,
		});

		for (const [_type, feed] of feeds) {
			applyPayloadToJoltydexFeed(payload, feed);
		}
	} catch (e) {
		console.error('Failed to load collection data', e);
	}
	isBrowserLoading.value = false;
}

async function loadMore(type: CollectibleType) {
	const feed = feeds.get(type)!;
	feed.isLoading.value = true;

	try {
		const payload = await loadJoltydexFeed({
			types: feedTypes,
			ownerUser: user.value,
			user: loggedInUser.value!,
			pos: feed.collectibles.value.length,
		});

		applyPayloadToJoltydexFeed(payload, feed);
	} catch (e) {
		console.error('Failed to load collection data', e);
	}

	feed.isLoading.value = false;
}
</script>

<template>
	<template
		v-for="[feedType, { collectibles, isLoading, reachedEnd }] of filteredFeeds"
		:key="feedType"
	>
		<h2
			:style="{
				marginTop: `0`,
				fontFamily: kFontFamilyDisplay,
			}"
		>
			{{ feedLabels[feedType] }}
		</h2>

		<div
			:style="{
				display: `grid`,
				gridTemplateColumns: `repeat(auto-fill, minmax(160px, 1fr))`,
				gridGap: `8px`,
			}"
		>
			<AppCollectibleThumb
				v-for="collectible of collectibles.value"
				:key="collectible.id"
				:collectible="collectible"
			/>
		</div>

		<AppSpacer vertical :scale="6" />

		<AppButton v-if="!isLoading.value && !reachedEnd.value" @click="loadMore(feedType)">
			{{ $gettext(`Load more`) }}
		</AppButton>

		<AppSpacer vertical :scale="10" />
	</template>
</template>
