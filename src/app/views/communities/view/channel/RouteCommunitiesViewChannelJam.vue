<script lang="ts">
import { PropType, computed, defineAsyncComponent, ref, toRef, toRefs } from 'vue';
import { router } from '../../..';
import AppFadeCollapse from '../../../../../_common/AppFadeCollapse.vue';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { CompetitionPeriodVoting } from '../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '../../../../../_common/community/competition/entry/entry.model';
import { showCommunityCompetitionEntrySubmitModal } from '../../../../../_common/community/competition/entry/submit-modal/submit-modal.service';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../_common/community/competition/voting-category/voting-category.model';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';
import { formatDate } from '../../../../../_common/filters/date';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import {
	asyncRouteLoader,
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../utils/array';
import AppCommunityCompetitionCountdown from '../../../../components/community/competition/countdown/AppCommunityCompetitionCountdown.vue';
import AppCommunityCompetitionEntryGrid from '../../../../components/community/competition/entry/grid/AppCommunityCompetitionEntryGrid.vue';
import AppCommunityPerms from '../../../../components/community/perms/AppCommunityPerms.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';
import { getChannelPathFromRoute, setCommunityMeta, useCommunityRouteStore } from '../view.store';

const RouteCommunitiesViewChannelJamEntries = defineAsyncComponent(() =>
	asyncRouteLoader(router, import('./RouteCommunitiesViewChannelJamEntries.vue'))
);

export default {
	...defineAppRouteOptions({
		deps: { params: ['path', 'channel'] },
		resolver: ({ route }) => {
			const channel = getChannelPathFromRoute(route);
			return Api.sendRequest(
				`/web/communities/competitions/entries/view/${route.params.path}/${channel}`
			);
		},
	}),
};
</script>

<script lang="ts" setup>
const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	channel: {
		type: Object as PropType<CommunityChannelModel>,
		required: true,
	},
});

const { community, channel } = toRefs(props);

const { competition } = useCommunityRouteStore()!;
const { user } = useCommonStore();

const canToggleDescription = ref(false);
const isDescriptionOpen = ref(false);
const isLoading = ref(true);
const userEntries = ref<CommunityCompetitionEntryModel[]>([]);
const categories = ref<CommunityCompetitionVotingCategoryModel[]>([]);

const hasSubmittedEntries = toRef(() => userEntries.value.length > 0);

const shouldShowUserSubmissions = computed(() => {
	if (isLoading.value || !competition.value) {
		return false;
	}

	// Guests can't submit.
	if (!user.value) {
		return false;
	}

	// Can't submit entries when you are blocked from the community.
	if (community.value.isBlocked) {
		return false;
	}

	// Competition is over and no submissions have been entered.
	if (competition.value.periodNum >= CompetitionPeriodVoting && userEntries.value.length === 0) {
		return false;
	}

	return true;
});

const canSubmitEntry = toRef(
	() =>
		competition.value?.period === 'running' &&
		channel.value.visibility === 'published' &&
		!channel.value.is_archived
);

const routeTitle = computed(() =>
	$gettext(`%{ channel } - %{ name } Community on Game Jolt`, {
		name: community.value.name,
		channel: channel.value.displayTitle,
	})
);

function toggleDescription() {
	isDescriptionOpen.value = !isDescriptionOpen.value;
}

function canToggleDescriptionChanged(canToggle: boolean) {
	canToggleDescription.value = canToggle;
}

async function onClickSubmit() {
	if (!competition.value) {
		return;
	}

	const result = await showCommunityCompetitionEntrySubmitModal(competition.value);
	if (result) {
		userEntries.value.unshift(result);

		showSuccessGrowl($gettext(`Successfully submitted your entry to the jam!`));

		if (competition.value) {
			// Triggers the grid to refetch.
			competition.value.entry_count++;
		}
	}
}

function onEntryRemoved(entry: CommunityCompetitionEntryModel) {
	arrayRemove(userEntries.value, i => i.id === entry.id);

	if (competition.value) {
		// Triggers the grid to refetch.
		competition.value.entry_count--;
	}
}

createAppRoute({
	routeTitle,
	disableTitleSuffix: true,
	onResolved({ payload }) {
		if (payload.entries) {
			userEntries.value = CommunityCompetitionEntryModel.populate(payload.entries);
		}
		if (payload.categories) {
			categories.value = CommunityCompetitionVotingCategoryModel.populate(payload.categories);
		}
		isLoading.value = false;

		if (routeTitle.value) {
			setCommunityMeta(community.value, routeTitle.value);
		}
	},
});
</script>

<template>
	<div>
		<AppCommunitiesViewPageContainer v-if="competition" full>
			<AppCommunityPerms :community="community" required="community-competitions">
				<AppButton
					icon="edit"
					:to="{
						name: 'communities.view.edit.channels.competition.overview',
						params: { id: community.id },
					}"
				>
					{{ $gettext(`Edit Jam`) }}
				</AppButton>
				<hr />
			</AppCommunityPerms>

			<div class="-header">
				<div class="-header-title">
					<h1 v-if="channel" :class="{ 'text-center': Screen.isXs, h2: Screen.isMobile }">
						{{ channel.displayTitle }}
					</h1>

					<div v-if="!competition.hasEnded" class="-header-subtitle text-muted">
						Submissions are open <b>{{ formatDate(competition.starts_on) }}</b> to
						<b>{{ formatDate(competition.ends_on) }}</b>
					</div>
				</div>
				<div class="-header-end">
					<div class="-header-meta">
						<AppCommunityCompetitionCountdown :competition="competition" />
					</div>
					<div v-if="canSubmitEntry" class="-header-actions">
						<AppButton primary solid @click="onClickSubmit">
							{{ $gettext(`Submit an entry`) }}
						</AppButton>
					</div>
				</div>
			</div>

			<div v-if="channel.description_content" class="sheet sheet-elevate">
				<AppFadeCollapse
					:collapse-height="500"
					:is-open="isDescriptionOpen"
					@require-change="canToggleDescriptionChanged"
				>
					<AppContentViewer :source="channel.description_content" />
				</AppFadeCollapse>

				<div v-if="canToggleDescription" class="page-cut page-cut-no-margin">
					<AppButton trans @click="toggleDescription()">
						{{ !isDescriptionOpen ? $gettext(`Show More`) : $gettext(`Less`) }}
					</AppButton>
				</div>
			</div>

			<template v-if="shouldShowUserSubmissions">
				<h2>
					{{ $gettext(`Your submissions`) }}

					<div v-if="canSubmitEntry" class="-submission-button">
						<AppButton @click="onClickSubmit">
							{{ $gettext(`Submit an entry`) }}
						</AppButton>
					</div>
				</h2>

				<template v-if="canSubmitEntry">
					<p v-if="!hasSubmittedEntries" class="help-block">
						{{ $gettext(`You have not submitted an entry to this jam... yet?`) }}
					</p>
				</template>
				<template v-else-if="competition.period === 'pre-comp'">
					<p class="help-block">
						{{
							$gettext(
								`You'll be able to submit your entry from this page once the jam starts.`
							)
						}}
					</p>
				</template>
				<template v-else-if="competition.periodNum >= 2">
					<p class="help-block">
						{{ $gettext(`The jam has ended and submissions are now closed.`) }}
					</p>
				</template>
				<template v-else-if="channel.visibility === 'draft'">
					<p v-if="!hasSubmittedEntries" class="help-block">
						{{
							$gettext(
								`The jam is set up as a draft. Publish the jam to open submissions.`
							)
						}}
					</p>
				</template>
				<template v-else-if="channel.is_archived">
					<p class="help-block">
						{{ $gettext(`This channel is archived and entries cannot be submitted.`) }}
					</p>
				</template>

				<div v-if="hasSubmittedEntries">
					<AppCommunityCompetitionEntryGrid
						:competition="competition"
						:num-placeholders="2"
						:entries="userEntries"
						show-remove
						@remove="onEntryRemoved($event)"
					/>
				</div>

				<br />
			</template>

			<template v-if="competition.hasStarted">
				<RouteCommunitiesViewChannelJamEntries
					:competition="competition"
					:categories="categories"
				/>
			</template>
		</AppCommunitiesViewPageContainer>
	</div>
</template>

<style lang="stylus" scoped>
.-header
	display: flex
	flex-direction: column
	align-items: center

	&-title
		flex: auto
		margin-bottom: $line-height-computed

		h1
			margin-top: 0

	&-end
		display: flex
		flex-direction: column
		align-items: center

	&-meta
		flex: none
		text-align: center

	&-actions
		flex: none
		margin-bottom: $line-height-computed

	@media $media-sm-up
		flex-direction: row
		align-items: flex-start

		&-title
			h1
				margin-bottom: 0

		&-subtitle
			margin-top: $line-height-computed

		&-end
			flex: none
			display: flex
			flex-direction: column
			align-items: flex-end
			margin-left: ($grid-gutter-width / 2)

		&-meta
			text-align: left

	@media $media-md-up
		&-subtitle
			margin-top: 0

		&-end
			flex-direction: row
			align-items: flex-start

		&-actions
			margin-left: ($grid-gutter-width / 2)

@media $media-sm-up
	.-submission-button
		display: inline-block
		margin-left: $grid-gutter-width
</style>
