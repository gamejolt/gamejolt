<script lang="ts" setup>
import { computed, ref } from 'vue';
import { fuzzysearch } from '../../../../utils/string';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppRealmFullCard, { REALM_CARD_RATIO } from '../../../../_common/realm/AppRealmFullCard.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { illPointyThing } from '../../../img/ill/illustrations';
import { useAppStore } from '../../../store/index';

const COL_COUNT = 2;

const { isBootstrapped, realms, realmCount } = useAppStore();

const filterQuery = ref('');

const filteredEntries = computed(() => {
	const query = filterQuery.value.toLowerCase().trim();
	if (!query) {
		return realms.value;
	}

	return realms.value.filter(i => fuzzysearch(query, i.name.toLowerCase()));
});
</script>

<template>
	<div id="shell-sidebar-realms" :style="`--col-count: ${COL_COUNT}`">
		<div class="-title">
			<span class="-title-text">
				{{ $gettext(`My realms`) }}
			</span>

			<span v-if="realmCount" class="-title-count">
				{{ `(${formatNumber(realmCount)})` }}
			</span>
		</div>

		<AppSpacer vertical :scale="4" />

		<input
			v-model="filterQuery"
			class="form-control"
			:placeholder="$gettext(`Filter...`)"
			:disabled="!isBootstrapped"
		/>

		<AppSpacer vertical :scale="4" />

		<template v-if="isBootstrapped && !filteredEntries.length">
			<AppIllustration :asset="illPointyThing">
				{{ $gettext(`We couldn't find what you were looking for`) }}
			</AppIllustration>
		</template>
		<div v-else class="-realms">
			<template v-if="!isBootstrapped">
				<AppAspectRatio
					v-for="i of COL_COUNT"
					:key="i"
					class="lazy-placeholder"
					:ratio="REALM_CARD_RATIO"
				/>
			</template>
			<template v-if="filteredEntries.length">
				<AppRealmFullCard
					v-for="realm of filteredEntries"
					:key="realm.id"
					:realm="realm"
					label-position="top-left"
					label-size="tiny"
					overlay-content
					:to="realm.routeLocation"
					no-sheet
					no-follow
				/>
			</template>
		</div>

		<!-- TODO(realms-discover-improvements) Auto-load more realms on scroll. -->
		<!-- TODO(realms-discover-improvements) Do we want to link to the /search/realms page? Should this list only include realms you follow? Figure out how to paginate this if we're allowing filtering/searching. -->
	</div>
</template>

<style lang="stylus" scoped>
#shell-sidebar-realms
	padding: 16px

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
	display: grid
	grid-template-columns: repeat(var(--col-count), minmax(0, 1fr))
	gap: 8px
</style>
