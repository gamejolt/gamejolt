<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { AppCondenseWhitespace } from '../../../../../../_common/condense-whitespace';
import { formatNumber } from '../../../../../../_common/filters/number';
import AppCommunityCompetitionEntryThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppCommunityCompetitionEntryThumbnail,
		AppCondenseWhitespace,
	},
})
export default class AppCommunityCompetitionEntryGrid extends Vue {
	@Prop({ type: Object, required: true }) competition!: CommunityCompetition;
	@Prop({ type: Array, required: true }) entries!: CommunityCompetitionEntry[];
	@Prop({ type: Number, default: 0 }) currentPage!: number;
	@Prop({ type: Number, default: 0 }) pageCount!: number;
	@Prop({ type: Number, default: 6 }) numPlaceholders!: number;
	@Prop(Object)
	category?: CommunityCompetitionVotingCategory;
	@Prop({ type: Boolean, default: false }) showRemove!: boolean;

	readonly formatNumber = formatNumber;

	get placeholderCount() {
		const iterators = [];
		for (let i = 0; i < this.numPlaceholders; i++) {
			iterators.push(i);
		}
		return iterators;
	}

	get shouldShowThumbnailRanks() {
		return (
			this.competition.is_voting_enabled &&
			this.competition.has_community_voting &&
			this.competition.are_results_calculated
		);
	}

	get shouldShowThumbnailAwards() {
		return (
			this.competition.is_voting_enabled &&
			this.competition.has_awards &&
			this.competition.periodNum >= CompetitionPeriodVoting
		);
	}

	@Emit('remove')
	emitRemove(_entry: CommunityCompetitionEntry) {}
}
</script>

<template>
	<div>
		<p v-if="pageCount > 0 && currentPage > 0" class="text-muted small">
			<translate
				:translate-params="{
					count: formatNumber(pageCount),
					page: formatNumber(currentPage),
				}"
			>
				Page %{ page } of %{ count }
			</translate>
		</p>

		<app-condense-whitespace class="-grid-items">
			<template v-if="entries.length > 0">
				<div v-for="entry of entries" :key="entry.id" class="-grid-item">
					<app-community-competition-entry-thumbnail
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
		</app-condense-whitespace>
	</div>
</template>

<style lang="stylus" src="./grid.styl" scoped></style>
