<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { TagsInfo } from '../../tag/tags-info.service';
import { GameFilteringContainer } from './container';

const props = defineProps({
	filtering: {
		type: Object as PropType<GameFilteringContainer>,
		required: true,
	},
});

interface ArrayFilter {
	type: 'array';
	options: { value: string; valueLabel: string }[];
}

interface RadioFilter {
	type: 'radio';
	value: any;
	valueLabel: string;
}

type Filter = (ArrayFilter | RadioFilter) & {
	key: string;
	label: string;
};

const { filtering } = toRefs(props);

const router = useRouter();
const route = useRoute();

const tag = computed(() => {
	const tag = route.params.tag;
	if (!tag) {
		return undefined;
	}

	return TagsInfo.tags.find(i => i.id === tag);
});

const filters = computed(() => {
	const filters: Filter[] = [];

	for (const [key, value] of Object.entries(filtering.value.filters)) {
		if (!value) {
			continue;
		}

		const type = GameFilteringContainer.definitions[key].type;
		const label = GameFilteringContainer.definitions[key].label;

		if (type === 'array') {
			filters.push({
				key,
				type,
				label,
				options: (value as string[]).map(i => ({
					value: i,
					valueLabel: GameFilteringContainer.definitions[key].options![i],
				})),
			});
		} else if (type === 'radio') {
			filters.push({
				key,
				type,
				label,
				value,
				valueLabel: GameFilteringContainer.definitions[key].options![value],
			});
		}
	}

	return filters;
});

function removeFilterOption(filter: string, option: any) {
	// Analytics.trackEvent('game-filtering', 'remove', filter + '-' + option);

	filtering.value.unsetFilter(filter, option);
	filtering.value.onChanged();
}

function clearTag() {
	router.push({ name: 'discover.games.list._fetch' });
}
</script>

<template>
	<div v-if="!filtering.areTagFiltersEmpty || tag" class="game-filtering-tags">
		<a v-if="tag" class="tag tag-highlight game-filtering-tag" @click="clearTag()">
			<strong><AppTranslate>Tag</AppTranslate>:</strong>
			{{ tag.label }}
			<AppJolticon icon="remove" />
		</a>

		<span v-for="filter of filters" :key="filter.key">
			<template v-if="filter.type === 'array'">
				<span v-for="(option, i) of filter.options" :key="i">
					<a
						class="tag tag-highlight game-filtering-tag"
						@click="removeFilterOption(filter.key, option.value)"
					>
						<strong>{{ filter.label }}:</strong>
						{{ option.valueLabel }}
						<AppJolticon icon="remove" />
					</a>
				</span>
			</template>
			<template v-else-if="filter.type === 'radio'">
				<a
					class="tag tag-highlight game-filtering-tag"
					@click="removeFilterOption(filter.key, filter.value)"
				>
					<strong>{{ filter.label }}:</strong>
					{{ filter.valueLabel }}
					<AppJolticon icon="remove" />
				</a>
			</template>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.game-filtering-tags
	margin-bottom: $line-height-computed

	a
		user-select: none

.game-filtering-tag
	margin-right: 5px
</style>
