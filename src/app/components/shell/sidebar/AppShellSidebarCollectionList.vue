<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import {
	GameCollectionModel,
	GameCollectionTypeDeveloper,
} from '~app/components/game/collection/collection.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { stringSort } from '~utils/array';

type Props = {
	collections: GameCollectionModel[];
	filter: string;
	shouldSort?: boolean;
};
const { collections, filter, shouldSort } = defineProps<Props>();

const filtered = computed(() => {
	if (!shouldSort) {
		return collections;
	}

	return [...collections].sort((a, b) => {
		const aVal = a.type === GameCollectionTypeDeveloper && a.owner ? a.owner.username : a.name;
		const bVal = b.type === GameCollectionTypeDeveloper && b.owner ? b.owner.username : b.name;
		return stringSort(aVal, bVal);
	});
});

/**
 * We compare the collection's name or owner's name if it's a subscription.
 * This way they can search for "cros" and get cros's games if they're following.
 */
function filterComparator(item: GameCollectionModel) {
	let actual: string;
	const expected = filter.toLowerCase();

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
				:to="collection.routeLocation"
				active-class="active"
				:title="collection.getTitle()"
			>
				<span class="shell-nav-icon">
					<AppJolticon icon="playlist" />
				</span>

				<span
					v-if="collection.owner && collection.type === GameCollectionTypeDeveloper"
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
