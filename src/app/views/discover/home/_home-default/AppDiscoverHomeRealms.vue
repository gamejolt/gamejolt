<script lang="ts" setup>
import { computed, PropType, ref, Ref, toRefs } from 'vue';
import { debounce } from '../../../../../utils/utils';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import AppRealmFullCard, {
	REALM_CARD_RATIO,
} from '../../../../../_common/realm/AppRealmFullCard.vue';
import { Realm } from '../../../../../_common/realm/realm-model';
import { Ruler } from '../../../../../_common/ruler/ruler-service';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { illPointyThing } from '../../../../img/ill/illustrations';
import { routeSearchRealms } from '../../../search/realms/realms.route';

const GRID_GAP_DESKTOP = 24;
const GRID_GAP_SM = GRID_GAP_DESKTOP;
const GRID_GAP_XS = 16;

const props = defineProps({
	realms: {
		type: Array as PropType<Realm[]>,
		required: true,
	},
	isLoading: {
		type: Boolean,
	},
	gridColumnsDesktop: {
		type: Number,
		default: 4,
	},
	gridColumnsSm: {
		type: Number,
		default: 3,
	},
	gridColumnsXs: {
		type: Number,
		default: 2,
	},
});

const {
	realms: propRealms,
	isLoading,
	gridColumnsDesktop,
	gridColumnsSm,
	gridColumnsXs,
} = toRefs(props);

const root = ref<HTMLDivElement>() as Ref<HTMLDivElement>;

const query = ref('');
const isFetching = ref(false);
const searchedRealms = ref<Realm[] | null>(null);
const realmCount = ref(0);

const safeQuery = computed(() => encodeURIComponent(query.value.trim()));

const currentGap = computed(() => {
	if (Screen.isXs) {
		return GRID_GAP_XS;
	} else if (Screen.isSm) {
		return GRID_GAP_SM;
	} else {
		return GRID_GAP_DESKTOP;
	}
});

const currentColumns = computed(() => {
	if (Screen.isXs) {
		return gridColumnsXs.value;
	} else if (Screen.isSm) {
		return gridColumnsSm.value;
	} else {
		return gridColumnsDesktop.value;
	}
});

const currentRows = computed(() => {
	if (shouldClampRows.value) {
		return 2;
	}

	return undefined;
});

const displayCount = computed(() => clampedDisplayRealms.value.length);
const shouldClampRows = computed(() => !!searchedRealms.value);

const shouldHideDisplayRealms = computed(
	() => !!searchedRealms.value && !searchedRealms.value.length
);
const rawDisplayRealms = computed(() =>
	searchedRealms.value && searchedRealms.value.length ? searchedRealms.value : propRealms.value
);
const clampedDisplayRealms = computed(() => {
	const list = rawDisplayRealms.value;
	if (currentRows.value) {
		return list.slice(0, currentColumns.value * currentRows.value);
	}
	return list;
});

const noGridMinHeight = computed(() => {
	const cols = currentColumns.value;
	const gapDiff = (cols - 1) * currentGap.value;
	const workingWidth = Ruler.width(root.value) - gapDiff;
	// Get the height of our realm card for our current grid gap and column display so things don't shift around when the illustration enters.
	return workingWidth / cols / REALM_CARD_RATIO + 'px';
});

const debounceSearch = debounce(_doSearch, 500);

function _onInput() {
	isFetching.value = true;
	debounceSearch();
}

async function _doSearch() {
	try {
		const q = safeQuery.value;
		if (!q.length) {
			searchedRealms.value = null;
			realmCount.value = 0;
			return;
		}

		isFetching.value = true;

		const payload = await Api.sendRequest(
			`/mobile/search`,
			{
				q,
				_fields: {
					realms: true,
					realmCount: true,
				},
			},
			{
				detach: true,
				allowComplexData: ['_fields'],
			}
		);

		searchedRealms.value = payload.realms ? Realm.populate(payload.realms) : [];
		realmCount.value = payload.realmCount || 0;
	} catch (e) {
		console.error(e);
		searchedRealms.value = [];
		realmCount.value = 0;
	} finally {
		isFetching.value = false;
	}
}
</script>

<template>
	<div ref="root" class="container">
		<div class="-header-container">
			<slot name="header" />

			<AppButton
				v-if="safeQuery.length && realmCount > displayCount"
				class="-header-more"
				:to="{ name: routeSearchRealms.name, query: { q: safeQuery } }"
			>
				{{ $gettext(`View more`) }}
				{{ ` (${formatNumber(realmCount)})` }}
			</AppButton>
		</div>

		<input
			v-model="query"
			class="form-control"
			:placeholder="$gettext(`Search realms...`)"
			:disabled="isLoading"
			@input="_onInput"
		/>

		<AppSpacer vertical :scale="4" />

		<AppLoadingFade class="-grid-container" :is-loading="isFetching">
			<div
				class="-grid"
				:style="[
					`--col-desktop: ${gridColumnsDesktop}`,
					`--col-sm: ${gridColumnsSm}`,
					`--col-xs: ${gridColumnsXs}`,
					`--col-gap-desktop: ${GRID_GAP_DESKTOP}px`,
					`--col-gap-sm: ${GRID_GAP_SM}px`,
					`--col-gap-xs: ${GRID_GAP_XS}px`,
					{
						visibility: shouldHideDisplayRealms ? 'hidden' : undefined,
					},
				]"
			>
				<template v-for="realm of clampedDisplayRealms" :key="realm.id">
					<AppRealmFullCard
						:realm="realm"
						:to="realm.routeLocation"
						label-position="bottom-left"
						overlay-content
						no-sheet
						no-follow
					/>
				</template>
			</div>

			<div
				v-if="shouldHideDisplayRealms"
				class="-no-grid"
				:style="{ minHeight: noGridMinHeight }"
			>
				<AppIllustration :asset="illPointyThing">
					{{ $gettext(`We couldn't find any realms that match those terms`) }}
				</AppIllustration>
			</div>
		</AppLoadingFade>
	</div>
</template>

<style lang="stylus" scoped>
.-header-container
	display: flex
	align-items: baseline

.-header-more
	margin-left: auto

.-grid-container
	position: relative

.-grid
	--grid-cols: var(--col-desktop)
	--grid-gap: var(--col-gap-desktop)
	display: grid
	grid-template-columns: repeat(var(--grid-cols), 1fr)
	gap: var(--grid-gap)
	justify-content: center

	@media $media-sm
		--grid-cols: var(--col-sm)
		--grid-gap: var(--col-gap-sm)

	@media $media-xs
		--grid-cols: var(--col-xs)
		--grid-gap: var(--col-gap-xs)

.-no-grid
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
</style>
