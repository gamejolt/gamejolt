<script lang="ts" setup>
import { computed, toRef } from 'vue';

import {
	CommunityCompetitionModel,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { formatNumber } from '../../../../../../_common/filters/number';
import AppCommunityCompetitionEntryThumbnail from '../thumbnail/AppCommunityCompetitionEntryThumbnail.vue';

type Props = {
	competition: CommunityCompetitionModel;
	entries: CommunityCompetitionEntryModel[];
	currentPage?: number;
	pageCount?: number;
	numPlaceholders?: number;
	category?: CommunityCompetitionVotingCategoryModel;
	showRemove?: boolean;
};
const { competition, entries, currentPage = 0, pageCount = 0, numPlaceholders = 6, category, showRemove } = defineProps<Props>();

const emit = defineEmits<{
	remove: [entry: CommunityCompetitionEntryModel];
}>();

const shouldShowThumbnailRanks = toRef(
	() =>
		competition.is_voting_enabled &&
		competition.has_community_voting &&
		competition.are_results_calculated
);

const shouldShowThumbnailAwards = toRef(
	() =>
		competition.is_voting_enabled &&
		competition.has_awards &&
		competition.periodNum >= CompetitionPeriodVoting
);

const placeholderCount = computed(() => {
	const iterators = [];
	for (let i = 0; i < numPlaceholders; i++) {
		iterators.push(i);
	}
	return iterators;
});

function emitRemove(entry: CommunityCompetitionEntryModel) {
	emit('remove', entry);
}
</script>

<template>
	<div>
		<p v-if="pageCount > 0 && currentPage > 0" class="text-muted small">
			{{
				$gettext(`Page %{ page } of %{ count }`, {
					page: formatNumber(currentPage),
					count: formatNumber(pageCount),
				})
			}}
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
