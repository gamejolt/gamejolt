<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import {
	CommunityCompetitionModel,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { formatNumber } from '../../../../../../_common/filters/number';
import AppCommunityCompetitionEntryThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppCommunityCompetitionEntryThumbnail,
	},
})
export default class AppCommunityCompetitionEntryGrid extends Vue {
	@Prop({ type: Object, required: true }) competition!: CommunityCompetitionModel;
	@Prop({ type: Array, required: true }) entries!: CommunityCompetitionEntryModel[];
	@Prop({ type: Number, default: 0 }) currentPage!: number;
	@Prop({ type: Number, default: 0 }) pageCount!: number;
	@Prop({ type: Number, default: 6 }) numPlaceholders!: number;
	@Prop(Object)
	category?: CommunityCompetitionVotingCategoryModel;
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
	emitRemove(_entry: CommunityCompetitionEntryModel) {}
}
</script>

<template>
	<div>
		<p v-if="pageCount > 0 && currentPage > 0" class="text-muted small">
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
