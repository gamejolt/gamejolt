<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { stringSort } from '../../../../utils/array';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { GameCollection } from '../../game/collection/collection.model';

const props = defineProps({
	collections: {
		type: Array as PropType<GameCollection[]>,
		required: true,
	},
	filter: {
		type: String,
		required: true,
	},
	shouldSort: {
		type: Boolean,
	},
});

const { collections, filter, shouldSort } = toRefs(props);

const filtered = computed(() => {
	if (!shouldSort.value) {
		return collections.value;
	}

	return [...collections.value].sort((a, b) => {
		const aVal = a.type === 'developer' && a.owner ? a.owner.username : a.name;
		const bVal = b.type === 'developer' && b.owner ? b.owner.username : b.name;
		return stringSort(aVal, bVal);
	});
});

/**
 * We compare the collection's name or owner's name if it's a subscription.
 * This way they can search for "cros" and get cros's games if they're following.
 */
function filterComparator(item: GameCollection) {
	let actual: string;
	const expected = filter.value.toLowerCase();

	actual = item.name.toLowerCase();
	if (actual.indexOf(expected) !== -1) {
		return true;
	}

	if (item.from_subscription && item.owner) {
		actual = item.owner.username.toLowerCase();
		if (actual.indexOf(expected) !== -1) {
			return true;
		}
	}

	return false;
}
</script>

<template>
	<ul class="shell-nav">
		<li
			v-for="collection of filtered"
			v-show="!filter || filterComparator(collection)"
			:key="collection._id"
			class="offline-disable"
		>
			<RouterLink
				v-app-track-event="`sidebar:collection:playlist`"
				:to="collection.routeLocation"
				active-class="active"
				:title="collection.getTitle()"
			>
				<span class="shell-nav-icon">
					<AppJolticon icon="playlist" />
				</span>

				<span
					v-if="collection.owner && collection.type === 'developer'"
					class="shell-nav-label"
				>
					@{{ collection.owner.username }}
				</span>

				<span v-else class="shell-nav-label">
					{{ collection.name }}

					<small v-if="collection.owner && collection.from_subscription">
						<AppTranslate translate-comment="As in made by: / the author is:">
							by
						</AppTranslate>
						@{{ collection.owner.username }}
					</small>
				</span>
			</RouterLink>
		</li>
	</ul>
</template>
