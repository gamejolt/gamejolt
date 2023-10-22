<script lang="ts" setup>
import { PropType, computed, onMounted, ref, toRef, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { Clipboard } from '../../../../../../_common/clipboard/clipboard-service';
import { CommunityCompetitionModel } from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionEntryVoteModel } from '../../../../../../_common/community/competition/entry/vote/vote.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { formatDate } from '../../../../../../_common/filters/date';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppTimeAgo from '../../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { $gettext, $ngettext } from '../../../../../../_common/translate/translate.service';
import AppUserVerifiedTick from '../../../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserCardHover from '../../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatar from '../../../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { numberSort } from '../../../../../../utils/array';
import AppGameBadge from '../../../../game/badge/AppGameBadge.vue';
import AppCommunityCompetitionVotingWidget from '../../voting/AppCommunityCompetitionVotingWidget.vue';

const props = defineProps({
	entry: {
		type: Object as PropType<CommunityCompetitionEntryModel>,
		default: undefined,
	},
	entryId: {
		type: Number,
		default: undefined,
	},
});

const { entry, entryId } = toRefs(props);
const modal = useModal()!;

const m_entry = ref<CommunityCompetitionEntryModel | null>(null);
const competition = ref<CommunityCompetitionModel | null>(null);
const votingCategories = ref<CommunityCompetitionVotingCategoryModel[]>([]);
const userVotes = ref<CommunityCompetitionEntryVoteModel[]>([]);
const isParticipant = ref(false);
const isArchived = ref(false);
const isBlocked = ref(false);
const isLoading = ref(true);

const author = toRef(() => m_entry.value!.author);

const shouldShowVoteCount = computed(
	() =>
		m_entry.value &&
		competition.value &&
		m_entry.value.vote_count > 0 &&
		!competition.value.are_results_calculated
);

const shouldShowAwards = computed(
	() =>
		competition.value &&
		competition.value.has_awards &&
		m_entry.value &&
		m_entry.value.awards &&
		m_entry.value.awards.length > 0
);

const sortedAwards = computed(() =>
	m_entry.value!.awards!.sort((a, b) =>
		numberSort(a.community_competition_award.sort, b.community_competition_award.sort)
	)
);

if (entry?.value) {
	m_entry.value = entry.value;
}

onMounted(async () => {
	const newEntryId = entryId?.value || entry?.value?.id;
	if (!newEntryId) {
		throw new Error('Entry or entryId has to be provided.');
	}

	const payload = await Api.sendRequest(
		`/web/communities/competitions/entries/view-entry/${newEntryId}`
	);

	isParticipant.value = payload.isParticipant;
	isArchived.value = payload.isArchived;
	isBlocked.value = payload.isBlocked;

	if (m_entry.value) {
		m_entry.value.assign(payload.entry);
	} else {
		m_entry.value = new CommunityCompetitionEntryModel(payload.entry);
	}

	competition.value = new CommunityCompetitionModel(payload.competition);

	if (payload.votingCategories) {
		votingCategories.value = CommunityCompetitionVotingCategoryModel.populate(
			payload.votingCategories
		);
	}
	if (payload.userVotes) {
		userVotes.value = CommunityCompetitionEntryVoteModel.populate(payload.userVotes);
	}

	isLoading.value = false;
});

function copyShareUrl() {
	Clipboard.copy(m_entry.value!.permalink);
}
</script>

<template>
	<AppModal class="-entry-modal">
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>
		<div class="modal-body">
			<template v-if="!!m_entry">
				<AppGameBadge full-bleed :game="m_entry.resource" />

				<div class="-section">
					<div class="pull-right">
						<AppUserCardHover :user="author">
							<AppUserAvatar class="-author-avatar" :user="author" />
						</AppUserCardHover>
					</div>
					<div>
						<div class="-author-name">
							{{ $gettext(`By`) }}
							<AppUserCardHover class="-hover-card" :user="author">
								<RouterLink
									:to="{
										name: 'profile.overview',
										params: { username: author.username },
									}"
								>
									{{ author.display_name }}
									<AppUserVerifiedTick :user="author" />
								</RouterLink>
							</AppUserCardHover>
						</div>
						<div class="-entered-date">
							{{ $gettext(`Entered on`) }}
							<b>{{ formatDate(m_entry.added_on, 'short') }}</b>
							<i class="text-muted">
								(<AppTimeAgo :date="m_entry.added_on" strict />)
							</i>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col-sm-6 -entry-button">
						<AppButton
							block
							primary
							icon="chevron-right"
							:to="m_entry.resource.routeLocation"
						>
							{{ $gettext(`View Game`) }}
						</AppButton>
					</div>
					<div class="col-sm-6 -entry-button">
						<AppButton block icon="link" @click="copyShareUrl">
							{{ $gettext(`Copy Voting Link`) }}
						</AppButton>
					</div>
				</div>

				<div v-if="m_entry.is_removed" class="-section alert alert-notice">
					<p>
						{{
							$gettext(
								`This entry was removed from the jam and cannot be viewed anymore.`
							)
						}}
					</p>
				</div>

				<div v-if="shouldShowAwards">
					<div v-for="entryAward of sortedAwards" :key="entryAward.id" class="-award">
						<AppJolticon
							v-app-tooltip.touchable="$gettext(`Jam Award`)"
							class="-award-icon"
							icon="medal"
							big
						/>
						<div class="-award-details">
							<h4 class="sans-margin">
								{{ entryAward.community_competition_award.name }}
							</h4>
							<div v-if="entryAward.community_competition_award.description">
								<small>
									{{ entryAward.community_competition_award.description }}
								</small>
							</div>
						</div>
					</div>
				</div>

				<div class="-section">
					<span v-if="shouldShowVoteCount" class="-vote-count">
						{{
							$ngettext(
								'This entry has %{ count } vote, currently.',
								'This entry has %{ count } votes, currently.',
								m_entry.vote_count,
								{ count: m_entry.vote_count }
							)
						}}
						{{ ' ' }}
						{{
							$gettext(`Check back after the voting period to see the final results.`)
						}}
					</span>

					<template v-if="competition">
						<AppCommunityCompetitionVotingWidget
							:competition="competition"
							:entry="m_entry"
							:voting-categories="votingCategories"
							:user-votes="userVotes"
							:is-participant="isParticipant"
							:is-archived="isArchived"
							:is-blocked="isBlocked"
						/>
					</template>
					<AppLoading v-else centered />
				</div>
			</template>

			<AppLoading v-else centered />
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-section
	margin-bottom: 24px

.-author
	&-name
		font-size: $font-size-large

	&-avatar
		width: 46px

.-hover-card
	display: inline-block !important

.-entry-button
	margin-bottom: 4px

.-vote-count
.-entered-date
	font-size: $font-size-small

.-award
	margin-top: 16px
	change-bg('bi-bg')
	color: var(--theme-bi-fg)
	padding: 16px
	rounded-corners-lg()

	&-icon
		float: left
		display: block

	&-details
		margin-left: 64px
		margin-top: 4px
</style>
