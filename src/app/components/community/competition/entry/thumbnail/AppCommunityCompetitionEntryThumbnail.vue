<script lang="ts" setup>
import { PropType, computed, toRef, toRefs } from 'vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import {
	$removeCommunityCompetitionEntry,
	CommunityCompetitionEntryModel,
} from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { GameModel } from '../../../../../../_common/game/game.model';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import { showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { showEntryFromCommunityCompetitionEntryModal } from '../modal/modal.service';

const props = defineProps({
	entry: {
		type: Object as PropType<CommunityCompetitionEntryModel>,
		required: true,
	},
	showRemove: {
		type: Boolean,
	},
	showRank: {
		type: Boolean,
	},
	votingCategory: {
		type: Object as PropType<CommunityCompetitionVotingCategoryModel>,
		default: undefined,
	},
	showAwards: {
		type: Boolean,
	},
});

const emit = defineEmits({
	remove: () => true,
});

const { entry, showRemove, showRank, votingCategory, showAwards } = toRefs(props);
const { user } = useCommonStore();

const shouldShowRemove = computed(
	() => showRemove.value && user.value && user.value.id === entry.value.user.id
);

const game = toRef(() => entry.value.resource as GameModel);

const shouldShowRank = computed(() => {
	if (!showRank.value) {
		return false;
	}

	if (!entry.value.vote_results || entry.value.vote_results.length === 0) {
		return false;
	}

	return !!displayRank.value;
});

const shouldShowNoVotes = computed(
	() =>
		showRank.value &&
		!votingCategory?.value &&
		(!entry.value.vote_results || entry.value.vote_results.length === 0)
);

const displayRank = computed(() => {
	// Find the result for the given category.
	const categoryId = votingCategory?.value ? votingCategory.value.id : null;
	const voteResult = entry.value.vote_results.find(
		i => i.community_competition_voting_category_id === categoryId
	);
	if (voteResult) {
		return voteResult.rank;
	}
});

const displayCategoryName = computed(() => {
	if (votingCategory?.value) {
		return votingCategory.value.name;
	}

	return $gettext(`Overall`);
});

const hasAwards = computed(() => entry.value.awards && entry.value.awards.length > 0);

const shouldShowAwards = computed(() => showAwards.value && hasAwards.value);

async function onClickRemove() {
	const result = await showModalConfirm(
		$gettext(`Are you sure you want to remove this entry from the jam?`)
	);

	if (result) {
		await $removeCommunityCompetitionEntry(entry.value);
		if (entry.value._removed) {
			showSuccessGrowl($gettext(`Your entry was successfully removed from the jam.`));
			emit('remove');
		}
	}
}

/** Instead of navigating to the link target, open the entry modal instead. */
function onClickThumbnail() {
	showEntryFromCommunityCompetitionEntryModal(entry.value);
}
</script>

<template>
	<div class="-container">
		<RouterLink :to="game.routeLocation">
			<div @click.prevent="onClickThumbnail">
				<div class="-thumb">
					<AppGameThumbnailImg :game="game" class="-game-img" />

					<div v-if="shouldShowAwards" class="-game-img-award-border" />

					<div class="-inner">
						<div v-if="shouldShowRank" class="-rank">
							{{ displayCategoryName }}
							{{ $gettext(`Rank`) }}
							<b>#{{ displayRank }}</b>
						</div>
						<div v-else-if="shouldShowNoVotes" class="-rank">
							{{ $gettext(`No Votes`) }}
						</div>
						<div v-if="shouldShowRemove" class="-remove">
							<AppButton
								v-app-tooltip="$gettext(`Remove Entry`)"
								icon="remove"
								sparse
								circle
								overlay
								@click.stop.prevent="onClickRemove"
							/>
						</div>
					</div>
				</div>
				<div class="-meta">
					<div class="-title-data">
						<span class="-title" :title="game.title">
							<b>{{ game.title }}</b>
						</span>
					</div>
					<div class="-author-data">
						<span
							v-translate="{ name: entry.user.display_name }"
							class="text-muted -author"
						>
							by %{ name }
						</span>
					</div>

					<div v-if="shouldShowAwards" class="-award-data">
						<span
							v-for="entryAward of entry.awards"
							:key="entryAward.id"
							v-app-tooltip="entryAward.community_competition_award.description"
							class="-award"
						>
							<AppJolticon class="-award-icon" icon="medal" />
							<small>
								<b>{{ entryAward.community_competition_award.name }}</b>
							</small>
						</span>
					</div>
				</div>
			</div>
		</RouterLink>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	margin-bottom: 24px

.-thumb
	position: relative
	rounded-corners-lg()

	&:hover
		.-rank
			opacity: 0.25

		.-game-img
			elevate-2()

.-game-img
	elevate-0()
	z-index: 2

.-game-img-award-border
	z-index: 1
	position: absolute
	left: -($border-width-large)
	top: -($border-width-large)
	bottom: -($border-width-large)
	right: -($border-width-large)
	background-color: var(--theme-bi-bg)
	rounded-corners-lg()

.-inner
	position: absolute
	z-index: 3
	rounded-corners-lg()
	overflow: hidden
	top: 0
	left: 0
	right: 0
	bottom: 0

.-rank
	position: absolute
	background-color: rgba(0, 0, 0, 0.5)
	backdrop-filter: blur(3px)
	color: white
	bottom: 0
	left: 0
	right: 0
	padding-top: 4px
	padding-bottom: 4px
	padding-left: 8px
	padding-right: 8px
	transition: opacity 0.1s ease

.-remove
	position: absolute
	right: 8px
	top: 8px

.-meta
	padding: 4px

.-title-data
	display: flex

.-title
	font-size: $font-size-large
	transition: color 0.1s ease
	text-overflow()

.-author-data
	display: flex

.-author
	text-overflow()

.-award-data
	display: flex
	flex-direction: column
	align-items: flex-start

.-award
	change-bg('bi-bg')
	width: auto
	color: var(--theme-bi-fg)
	padding-top: 4px
	padding-bottom: 4px
	padding-left: 12px
	padding-right: 12px
	display: inline-flex
	rounded-corners()
	margin-top: 4px

	&-icon
		display: inline-block
		margin-right: 8px
</style>
