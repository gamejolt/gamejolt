<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import {
	CommunityCompetitionModel,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { formatNumber } from '../../../../../../_common/filters/number';
import AppCommunityCompetitionEntryThumbnail from '../thumbnail/AppCommunityCompetitionEntryThumbnail.vue';

const props = defineProps({
	competition: {
		type: Object as PropType<CommunityCompetitionModel>,
		required: true,
	},
	entries: {
		type: Array as PropType<CommunityCompetitionEntryModel[]>,
		required: true,
	},
	currentPage: {
		type: Number,
		default: 0,
	},
	pageCount: {
		type: Number,
		default: 0,
	},
	numPlaceholders: {
		type: Number,
		default: 6,
	},
	category: {
		type: Object as PropType<CommunityCompetitionVotingCategoryModel>,
		// TODO(component-setup-refactor):check this
		default: undefined,
	},
	showRemove: {
		type: Boolean,
	},
});

const emit = defineEmits({
	remove: (_entry: CommunityCompetitionEntryModel) => true,
});

const { competition, entries, currentPage, pageCount, numPlaceholders, category, showRemove } =
	toRefs(props);

const placeholderCount = computed(() => {
	const iterators = [];
	for (let i = 0; i < numPlaceholders.value; i++) {
		iterators.push(i);
	}
	return iterators;
});

const shouldShowThumbnailRanks = computed(
	() =>
		competition.value.is_voting_enabled &&
		competition.value.has_community_voting &&
		competition.value.are_results_calculated
);

const shouldShowThumbnailAwards = computed(
	() =>
		competition.value.is_voting_enabled &&
		competition.value.has_awards &&
		competition.value.periodNum >= CompetitionPeriodVoting
);

function emitRemove(entry: CommunityCompetitionEntryModel) {
	emit('remove', entry);
}
</script>

<template>
	<div>
		<p v-if="pageCount > 0 && currentPage > 0" class="text-muted small">
			<!--TODO(component-setup-refactor): how to include :translate-params into gettext-->
			<AppTranslate
				:translate-params="{
					count: formatNumber(pageCount),
					page: formatNumber(currentPage),
				}"
			>
				Page %{ page } of %{ count }
			</AppTranslate>
		</p>

		<div class="-grid-items">
			<template v-if="entries.length > 0">
				<div v-for="entry of entries" :key="entry.id" class="-grid-item">
					<AppCommunityCompetitionEntryThumbnail
						:entry="entry"
						:show-rank="shouldShowThumbnailRanks"
						:voting-category="category"
						:show-awards="shouldShowThumbnailAwards"
						:show-remove="showRemove"
						@remove="emitRemove(entry)"
					/>
				</div>
			</template>
			<template v-else>
				<div
					v-for="i of placeholderCount"
					:key="i"
					class="-grid-item -grid-item-placeholder"
				>
					<div class="-grid-item-placeholder-part -grid-item-placeholder-thumb">
						<div
							v-if="shouldShowThumbnailRanks"
							class="-grid-item-placeholder-overlay"
						/>
					</div>
					<div class="-grid-item-placeholder-part -grid-item-placeholder-name" />
					<div class="-grid-item-placeholder-part -grid-item-placeholder-user" />
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" src="./grid.styl" scoped></style>
