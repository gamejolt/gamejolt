<script lang="ts" setup>
import { PropType, computed, ref, toRefs, watch } from 'vue';
import { Api } from '../../api/api.service';
import AppButton from '../../button/AppButton.vue';
import AppLoading from '../../loading/AppLoading.vue';
import { Screen } from '../../screen/screen-service';
import { $gettext } from '../../translate/translate.service';
import { populateTrophies } from '../../user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../user/trophy/user-base-trophy.model';
import AppTrophyCard from '../AppTrophyCard.vue';

const PAGE_SIZE = 12;

const props = defineProps({
	url: {
		type: String,
		required: true,
	},
	initialTrophies: {
		type: Array as PropType<UserBaseTrophy[]>,
		required: false,
		default: () => [],
	},
});

const { url, initialTrophies } = toRefs(props);

const trophies = ref<UserBaseTrophy[]>([]);
const isLoading = ref(false);
const reachedEnd = ref(false);

const placeholderCount = computed(() => {
	// 2 rows, except for xs.
	if (Screen.isXs) {
		return 1;
	} else if (Screen.isSm) {
		return 4;
	}
	return 6;
});

const shouldShowLoadMore = computed(() => !reachedEnd.value);

async function loadNext() {
	let requestUrl = url.value;
	if (trophies.value.length > 0) {
		const lastTrophy = trophies.value[trophies.value.length - 1];
		requestUrl += `?scroll=${lastTrophy.logged_on}`;
	}

	const payload = await Api.sendRequest(requestUrl);
	return populateTrophies(payload.trophies);
}

async function onClickLoadMore() {
	if (isLoading.value) {
		return;
	}

	isLoading.value = true;
	const nextTrophies = await loadNext();
	if (!nextTrophies || !nextTrophies.length) {
		reachedEnd.value = true;
	} else {
		trophies.value.push(...nextTrophies);
		if (nextTrophies.length < PAGE_SIZE) {
			reachedEnd.value = true;
		}
	}

	isLoading.value = false;
}

watch(
	initialTrophies,
	newTrophies => {
		// If the initial trophies changed, it means that the route was bootstrapped. Gotta clear
		// everything out again.

		trophies.value = [];
		reachedEnd.value = false;

		if (newTrophies) {
			trophies.value.push(...newTrophies);
		}

		if (trophies.value.length < PAGE_SIZE) {
			reachedEnd.value = true;
		}
	},
	{ immediate: true }
);
</script>

<template>
	<div>
		<div v-if="!trophies.length" class="row">
			<div v-for="i of placeholderCount" :key="i" class="-item col-sm-6 col-md-4 col-lg-4">
				<!-- TODO: Make real placeholder -->
				.
			</div>
		</div>
		<template v-else>
			<div class="row">
				<div
					v-for="trophy of trophies"
					:key="trophy.key"
					class="-item col-sm-6 col-md-4 col-lg-4"
				>
					<AppTrophyCard :user-trophy="trophy" />
				</div>
			</div>

			<AppLoading v-if="isLoading" centered />
			<div v-else-if="shouldShowLoadMore" class="page-cut">
				<AppButton
					v-app-track-event="`profile-trophies:more`"
					trans
					@click="onClickLoadMore()"
				>
					{{ $gettext(`Load More`) }}
				</AppButton>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	@media $media-sm
		&:nth-child(2n+1)
			clear: both

	@media $media-md
		&:nth-child(3n+1)
			clear: both

	@media $media-lg
		&:nth-child(3n+1)
			clear: both
</style>
