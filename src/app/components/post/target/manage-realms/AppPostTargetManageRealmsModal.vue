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
		const body = {
			...(isOverview ? {} : { q: safeQuery }),
			_fields: {
				realms: {
					pos,
					perPage,
				},
			},
		};

		const options: RequestOptions = {
			detach: true,
			allowComplexData: ['_fields'],
		};

		if (isOverview) {
			// TODO(realms-discover-improvements) Endpoint to fetch own realms, paginate
			return Api.sendRequest(`/mobile/galaxy`, body, options);
		} else {
			return Api.sendRequest(`/mobile/search`, body, options);
		}
	}

	async function init() {
		const pos = 1;
		isLoading.value = true;

		try {
			const response = await _makeRequest(pos);
			page.value = pos;

			const rawRealms: any[] = response.realms || [];
			realms.value = Realm.populate(rawRealms);

			reachedEnd.value = rawRealms.length < perPage;
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
		query,
		safeQuery,
		perPage,
		realms,
		isBootstrapped,
		isLoading,
		reachedEnd,
		hasError,

		init,
		loadMore,
	};
}
</script>

<script lang="ts" setup>
import { computed, onMounted, PropType, ref, shallowRef, toRefs } from 'vue';
import { arrayRemove } from '../../../../../utils/array';
import { debounce } from '../../../../../utils/utils';
import { Api, RequestOptions } from '../../../../../_common/api/api.service';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import AppRealmFullCard, {
	REALM_CARD_RATIO,
} from '../../../../../_common/realm/AppRealmFullCard.vue';
import { Realm } from '../../../../../_common/realm/realm-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { illPointyThing } from '../../../../img/ill/illustrations';
import AppPostTargetRealm from '../AppPostTargetRealm.vue';

const COL_COUNT_BASE = 4;
const COL_COUNT_XS = 2;

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
const reachedEnd = computed(() => renderedFeed.value.reachedEnd.value);

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

function selectRealm(realm: Realm) {
	if (selectedRealms.value.length >= maxRealms.value || isRealmSelected(realm)) {
		return;
	}

	selectedRealms.value.push(realm);
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

	// TODO(realms-discover-improvements) might want to clear out old search feeds after we get a certain amount?

	newFeed.init();
	renderedFeedQuery.value = query;
}, 500);
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton icon="chevron-left" @click="modal.dismiss()">
				{{ $gettext(`Back`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<div class="-title">
					<span class="-title-text">
						{{ $gettext(`Manage realms`) }}
					</span>

					<span class="-title-count">
						{{ `(${formatNumber(selectedRealms.length)}/${formatNumber(maxRealms)})` }}
					</span>
				</div>
			</h2>
		</div>

		<div
			class="modal-body"
			:is-loading="isLoading"
			:style="[`--col-count-base: ${COL_COUNT_BASE}`, `--col-count-xs: ${COL_COUNT_XS}`]"
		>
			<AppExpand :when="selectedRealms.length > 0">
				<div class="-selected-realms">
					<TransitionGroup>
						<AppPostTargetRealm
							v-for="realm of selectedRealms"
							:key="realm.id"
							class="-realm-wrapper anim-fade-in-right anim-fade-leave-shrink"
							:realm="realm"
							can-remove
							@remove="removeRealm(realm)"
						/>
					</TransitionGroup>
				</div>
			</AppExpand>

			<AppSpacer vertical :scale="2" />
			<input
				v-model="currentQuery"
				class="form-control"
				:placeholder="$gettext(`Search realms...`)"
				@input="debounceSearchInput"
			/>
			<AppSpacer vertical :scale="4" />

			<AppLoadingFade :is-loading="isLoading">
				<template v-if="isBootstrapped && !realms.length">
					<AppIllustration :asset="illPointyThing">
						{{ $gettext(`We couldn't find what you were looking for`) }}
					</AppIllustration>
				</template>
				<div v-else class="-realms">
					<template v-if="!isBootstrapped">
						<AppAspectRatio
							v-for="i of COL_COUNT_BASE"
							:key="i"
							class="lazy-placeholder"
							:ratio="REALM_CARD_RATIO"
						/>
					</template>
					<template v-else-if="realms.length">
						<div v-for="realm of realms" :key="realm.id" class="-realm-wrapper">
							<AppRealmFullCard
								class="-hazy-transition"
								:class="{
									'-hazy': !canAddRealms && !isRealmSelected(realm),
								}"
								:realm="realm"
								label-position="top-left"
								:label-size="Screen.isMobile ? 'tiny' : undefined"
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
			</AppLoadingFade>

			<!-- TODO(realms-discover-improvements) Auto-load more realms on scroll. -->
			<!-- TODO(realms-discover-improvements) Do we want to link to the /search/realms page? Should this list only include realms you follow? Figure out how to paginate this if we're allowing filtering/searching. -->
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.modal-body
	padding-top: 0

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
	display: flex
	gap: 8px
	flex-flow: row wrap
	max-width: 100%

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
</style>
