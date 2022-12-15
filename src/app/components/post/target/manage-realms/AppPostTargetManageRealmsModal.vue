<script lang="ts">
type RealmSearchFeed = ReturnType<typeof createRealmSearchFeed>;

function createRealmSearchFeed(query: string) {
	const safeQuery = encodeURIComponent(query);
	const perPage = 12;
	const isOverview = !query.length;

	const realms = ref<Realm[]>([]);

	const isBootstrapped = ref(false);
	const isLoading = ref(false);
	const hasError = ref(false);

	const page = ref(1);
	const reachedEnd = ref(false);

	const canLoadMore = computed(() => !reachedEnd.value && !hasError.value);

	async function _makeRequest(pos: number) {
		const options: RequestOptions = {
			detach: true,
		};

		let payload: any;

		if (isOverview) {
			payload = await Api.sendRequest(`/web/discover`, null, options);
		} else {
			const searchParams = [`q=${safeQuery}`];
			if (pos > 1) {
				searchParams.push(`page=${pos}`);
			}

			payload = await Api.sendRequest(
				`/web/search/realms?${searchParams.join('&')}`,
				null,
				options
			);
		}

		if (payload.featuredRealms) {
			payload.realms = payload.featuredRealms;
			delete payload.featuredRealms;
		}

		return payload;
	}

	async function init() {
		const pos = 1;
		isLoading.value = true;

		try {
			const response = await _makeRequest(pos);
			page.value = pos;

			const rawRealms: any[] = response.realms || [];
			realms.value = Realm.populate(rawRealms);

			reachedEnd.value = isOverview || rawRealms.length < perPage;
			isBootstrapped.value = true;
		} catch (e) {
			console.error(e);
			hasError.value = true;
		} finally {
			isLoading.value = false;
		}
	}

	async function loadMore() {
		if (!canLoadMore.value) {
			return;
		}

		const pos = page.value + 1;
		isLoading.value = true;

		try {
			const response = await _makeRequest(pos);
			page.value = pos;

			const rawRealms: any[] = response.realms || [];
			realms.value.push(...Realm.populate(rawRealms));

			reachedEnd.value = rawRealms.length < perPage;
		} catch (e) {
			console.error(e);
			hasError.value = true;
		} finally {
			isLoading.value = false;
		}
	}

	return {
		isOverview,
		query,
		safeQuery,
		perPage,
		realms,
		isBootstrapped,
		isLoading,
		reachedEnd,
		hasError,
		canLoadMore,

		init,
		loadMore,
	};
}
</script>

<script lang="ts" setup>
import { computed, nextTick, onMounted, PropType, ref, shallowRef, toRefs } from 'vue';
import { arrayRemove } from '../../../../../utils/array';
import { debounce } from '../../../../../utils/utils';
import { Api, RequestOptions } from '../../../../../_common/api/api.service';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import AppRealmFullCard, {
	REALM_CARD_RATIO,
} from '../../../../../_common/realm/AppRealmFullCard.vue';
import { Realm } from '../../../../../_common/realm/realm-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../_common/scroll/AppScrollAffix.vue';
import AppScrollScroller, {
	createScroller,
} from '../../../../../_common/scroll/AppScrollScroller.vue';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { illPointyThing } from '../../../../img/ill/illustrations';
import AppPostTargetRealm from '../AppPostTargetRealm.vue';

const COL_COUNT_BASE = 4;
const COL_COUNT_XS = 2;

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height}px` });

const props = defineProps({
	selectedRealms: {
		type: Array as PropType<Realm[]>,
		required: true,
	},
	maxRealms: {
		type: Number,
		required: true,
	},
});

const { selectedRealms, maxRealms } = toRefs(props);

const modal = useModal()!;
const scrollController = createScroller();

const currentQuery = ref('');

const realmFeeds = shallowRef(new Map<string, RealmSearchFeed>());
const renderedFeedQuery = ref<string>(currentQuery.value);

const baseFeed = createRealmSearchFeed(currentQuery.value);
realmFeeds.value.set(currentQuery.value, baseFeed);

const renderedFeed = computed(() => {
	if (realmFeeds.value.has(renderedFeedQuery.value)) {
		return realmFeeds.value.get(renderedFeedQuery.value)!;
	}
	return baseFeed;
});

const realms = computed(() => renderedFeed.value.realms.value);
const isBootstrapped = computed(() => renderedFeed.value.isBootstrapped.value);
const isLoading = computed(() => renderedFeed.value.isLoading.value);
const isOverview = computed(() => renderedFeed.value.isOverview);
const hasError = computed(() => renderedFeed.value.hasError.value);

const canLoadMore = computed(() => renderedFeed.value.canLoadMore.value);
const canAddRealms = computed(() => selectedRealms.value.length < maxRealms.value);

onMounted(() => {
	realmFeeds.value.get(currentQuery.value)?.init();
});

function isRealmSelected(realm: Realm) {
	return selectedRealms.value.findIndex(i => i.id === realm.id) !== -1;
}

function toggleRealmSelection(realm: Realm) {
	if (isRealmSelected(realm)) {
		removeRealm(realm);
	} else {
		selectRealm(realm);
	}
}

async function selectRealm(realm: Realm) {
	if (selectedRealms.value.length >= maxRealms.value || isRealmSelected(realm)) {
		return;
	}

	selectedRealms.value.push(realm);
	await nextTick();
	const offset = scrollController.element.value?.scrollWidth;
	if (offset) {
		scrollController.scrollTo(offset, {
			edge: 'left',
			behavior: 'smooth',
		});
	}
}

function removeRealm(realm: Realm) {
	arrayRemove(selectedRealms.value, i => i.id === realm.id);
}

const debounceSearchInput = debounce(() => {
	const query = currentQuery.value;
	if (!query.length) {
		renderedFeedQuery.value = '';
		return;
	}

	if (realmFeeds.value.has(query)) {
		renderedFeedQuery.value = query;
		return;
	}

	const newFeed = createRealmSearchFeed(query);
	realmFeeds.value.set(query, newFeed);

	newFeed.init();
	renderedFeedQuery.value = query;
}, 500);
</script>

<template>
	<AppModal>
		<AppScrollAffix class="-floating-top-anchor" anchor="top" :offset-top="0" :padding="0">
			<div class="modal-controls">
				<AppButton @click="modal.resolve()">
					{{ $gettext(`Confirm`) }}
				</AppButton>
			</div>

			<div class="-floating-top">
				<div class="-sans-padding-horizontal modal-header">
					<h2 class="modal-title">
						<div class="-title">
							<span class="-title-text">
								{{ $gettext(`Manage realms`) }}
							</span>

							<span class="-title-count">
								{{
									`(${formatNumber(selectedRealms.length)}/${formatNumber(
										maxRealms
									)})`
								}}
							</span>
						</div>
					</h2>
				</div>

				<AppExpand :when="selectedRealms.length > 0">
					<AppScrollScroller horizontal :controller="scrollController">
						<div class="-selected-realms">
							<AppPostTargetRealm
								v-for="realm of selectedRealms"
								:key="realm.id"
								class="-realm-wrapper"
								:realm="realm"
								can-remove
								@remove="removeRealm(realm)"
							/>
						</div>
					</AppScrollScroller>
				</AppExpand>

				<AppSpacer vertical :scale="2" />
				<input
					v-model="currentQuery"
					class="form-control"
					:placeholder="$gettext(`Search realms...`)"
					@input="debounceSearchInput"
				/>
				<AppSpacer vertical :scale="4" />
			</div>
		</AppScrollAffix>

		<div
			class="modal-body"
			:style="[`--col-count-base: ${COL_COUNT_BASE}`, `--col-count-xs: ${COL_COUNT_XS}`]"
		>
			<template v-if="(isBootstrapped && !realms.length) || (!isBootstrapped && hasError)">
				<AppIllustration :asset="illPointyThing">
					{{ $gettext(`We couldn't find what you were looking for`) }}
				</AppIllustration>
			</template>
			<template v-else>
				<div class="-realms">
					<template v-if="!isBootstrapped">
						<AppAspectRatio
							v-for="i of COL_COUNT_BASE * 2"
							:key="i"
							class="-placeholder"
							:ratio="REALM_CARD_RATIO"
						>
							<div class="-placeholder" />
						</AppAspectRatio>
					</template>
					<template v-else-if="realms.length">
						<div v-for="realm of realms" :key="realm.id" class="-realm-wrapper">
							<AppRealmFullCard
								class="-hazy-transition"
								:class="{
									'-hazy': !canAddRealms && !isRealmSelected(realm),
								}"
								:realm="realm"
								label-position="bottom-left"
								label-size="tiny"
								overlay-content
								no-sheet
								no-follow
								ondragstart="return false"
								@click="toggleRealmSelection(realm)"
							/>

							<div v-if="isRealmSelected(realm)" class="-check-overlay">
								<div class="-check-overlay-circle">
									<AppJolticon class="-icon" icon="check" />
								</div>
							</div>
							<div
								v-else
								class="-realm-hover"
								:class="{ '-force-show-touch': !canAddRealms }"
							>
								<template v-if="canAddRealms">
									<AppJolticon class="-icon" icon="add" />

									<div>
										{{ $gettext(`Add`) }}
									</div>
								</template>
								<template v-else>
									<AppJolticon class="-icon" icon="exclamation-circle" />

									<div>
										{{ $gettext(`Realm limit reached`) }}
									</div>
								</template>
							</div>
						</div>
					</template>
				</div>

				<template v-if="canLoadMore">
					<AppScrollInview
						v-if="!isLoading"
						:config="InviewConfig"
						@inview="renderedFeed.loadMore()"
					/>
					<AppLoading v-else class="-loading-more" centered />
				</template>
				<template v-else-if="isOverview">
					<AppSpacer vertical :scale="4" />
					<div class="well sans-margin-bottom fill-darker text-center">
						{{ $gettext(`Search for more realms above!`) }}
					</div>
				</template>
			</template>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.modal-body
	padding-top: 0

.-placeholder
	rounded-corners-lg()
	change-bg(bg-subtle)

.-title
	vertical-align: middle

.-title-text
	font-family: $font-family-heading

.-title-count
	margin-left: 4px
	font-size: $font-size-tiny
	opacity: 0.7
	font-weight: 700

.-realms
	--col-count: var(--col-count-base)
	display: grid
	grid-template-columns: repeat(var(--col-count), minmax(0, 1fr))
	gap: 8px

	@media $media-xs
		--col-count: var(--col-count-xs)

.-selected-realms
	display: inline-flex
	gap: 8px
	white-space: nowrap

.-realm-wrapper
	position: relative
	user-select: none
	cursor: pointer

	&:hover
		.-realm-hover
			opacity: 1

.-hazy-transition
	transition: filter 300ms

.-hazy
	filter: grayscale(1) opacity(0.3)

.-no-mouse
	@media $media-pointer-mouse
		visibility: hidden
		display: none

.-check-overlay
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	pointer-events: none

.-check-overlay-circle
	img-circle()
	elevate-1()
	change-bg(bi-bg)
	width: 48px
	height: 48px
	display: flex
	align-items: center
	justify-content: center

	.-icon
		font-size: 32px
		margin: 0
		color: var(--theme-bi-fg)

.-realm-hover
	rounded-corners-lg()
	pointer-events: none
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	padding: 12px
	display: flex
	flex-direction: column
	justify-content: center
	align-items: center
	gap: 8px
	font-size: $font-size-h4
	font-weight: bold
	transition: opacity 300ms
	background: rgba($black, 0.5)
	color: white
	z-index: 2
	text-align: center
	visibility: hidden
	opacity: 0

	&.-force-show-touch
		@media $media-pointer-coarse
			visibility: visible !important
			opacity: 1 !important

	@media $media-pointer-mouse
		visibility: visible

	.-icon
		font-size: $font-size-h2

.-floating-top-anchor
	--float-padding: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		--float-padding: ($grid-gutter-width / 2)

	.-floating-top
		background-color: var(--theme-bg-actual)
		transition: box-shadow 300ms $strong-ease-out
		padding: 0 var(--float-padding)

	::v-deep(.gj-scroll-affixed)
		z-index: 3

		.modal-controls
			background-color: var(--theme-bg-actual)
			position: relative
			z-index: 2

		.-floating-top
			box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5)
			z-index: 1

.-sans-padding-horizontal
	padding-left: 0
	padding-right: 0
</style>
