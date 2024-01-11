<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../../../_common/button/AppButton.vue';
import { $publishCommunityChannel } from '../../../../../../../../../_common/community/channel/channel.model';
import { CommunityCompetitionVotingCategoryModel } from '../../../../../../../../../_common/community/competition/voting-category/voting-category.model';
import { Environment } from '../../../../../../../../../_common/environment/environment.service';
import { formatDuration } from '../../../../../../../../../_common/filters/duration';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import AppTimeAgo from '../../../../../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import AppCommunityCompetitionDate from '../../../../../../../../components/community/competition/date/AppCommunityCompetitionDate.vue';
import { useCommunityRouteStore } from '../../../../../view.store';

export default {
	...defineAppRouteOptions({
		deps: { params: ['id', 'channel'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				`/web/dash/communities/competitions/${route.params.id}/${route.params.channel}`
			),
	}),
};
</script>

<script lang="ts" setup>
const { channel, competition, community } = useCommunityRouteStore()!;

const votingCategories = ref<CommunityCompetitionVotingCategoryModel[]>([]);
const isLoading = ref(true);

const competitionRuntime = computed(
	() => (competition.value!.ends_on - competition.value!.starts_on) / 1000
);

const competitionVotingRuntime = computed(
	() => (competition.value!.voting_ends_on - competition.value!.ends_on) / 1000
);

/** Shows a warning message when voting categories are enabled, but none are set up. */
const shouldShowCategoryWarning = computed(
	() =>
		!isLoading.value &&
		competition.value!.is_voting_enabled &&
		competition.value!.has_community_voting &&
		competition.value!.voting_type === 'categories' &&
		votingCategories.value.length === 0
);

async function onClickPublish() {
	const result = await showModalConfirm(
		$gettext(
			`Are you sure you want to publish your jam? You will not be able to set it back to draft.`
		),
		$gettext(`Publish your jam`)
	);

	if (result) {
		await $publishCommunityChannel(channel.value!);

		showSuccessGrowl($gettext(`Your jam has been published!`));
	}
}

createAppRoute({
	onResolved({ payload }) {
		if (payload && payload.votingCategories) {
			votingCategories.value = CommunityCompetitionVotingCategoryModel.populate(
				payload.votingCategories
			);
		}
		isLoading.value = false;
	},
});
</script>

<template>
	<div>
		<h2 class="sans-margin-top">
			{{ $gettext(`Jam Overview`) }}
		</h2>
		<p class="help-block">
			<!-- Starts on -->
			<span>
				<template v-if="competition!.periodNum === 0">
					{{ $gettext(`Your jam will start in about`) }}
					{{ ' ' }}
					<AppTimeAgo without-suffix is-future :date="competition!.starts_on" />
				</template>
				<template v-else>
					{{ $gettext(`Your jam started about`) }}
					{{ ' ' }}
					<AppTimeAgo :date="competition!.starts_on" />
				</template>
			</span>

			<br />

			<!-- Ends on -->
			<span>
				<template v-if="competition!.periodNum < 2">
					{{ $gettext(`It will run for about`) }}
				</template>
				<template v-else>
					{{ $gettext(`It ran for about`) }}
				</template>
				{{ formatDuration(competitionRuntime, 'en') }}
			</span>

			<br />

			<!-- Voting ends on -->
			<span>
				<template v-if="competition!.is_voting_enabled">
					<template v-if="competition!.periodNum < 3">
						{{ $gettext(`Voting will last for about`) }}
					</template>
					<template v-else>
						{{ $gettext(`Voting lasted for about`) }}
					</template>
					{{ formatDuration(competitionVotingRuntime, 'en') }}
				</template>
				<template v-else>
					<i>
						{{ $gettext(`Voting is disabled.`) }}
					</i>
				</template>
			</span>
		</p>

		<div v-if="shouldShowCategoryWarning" class="alert alert-notice">
			<p>
				{{
					$gettext(
						`Your jam is set to let users vote within categories once the voting period starts. However, no voting categories are set up.`
					)
				}}
			</p>
			<p>
				{{
					$gettext(
						`You must set up voting categories before the jam is over, or users will not be able to vote on entries.`
					)
				}}
			</p>

			<AppButton
				block
				overlay
				icon="edit"
				:to="{
					name: 'communities.view.edit.channels.competition.voting',
				}"
			>
				{{ $gettext(`Set Up Voting`) }}
			</AppButton>
		</div>

		<div v-if="channel!.visibility === 'draft'" class="alert alert-notice">
			<p>
				<span v-translate><b>This jam is a draft</b> and only moderators can view it.</span>
			</p>
			<p>
				{{
					$gettext(
						`You can leave it as a draft and work on it, then publish it when you're ready for it to be visible in the community's channel list.`
					)
				}}
			</p>
			<AppButton block overlay icon="active" @click="onClickPublish">
				{{ $gettext(`Publish`) }}
			</AppButton>
		</div>

		<table class="table">
			<tbody>
				<tr>
					<th>
						{{ $gettext(`Jam name`) }}
						<AppJolticon
							v-app-tooltip.touchable="
								$gettext(
									`The jam's name is the same as the channel's display name.`
								)
							"
							class="text-muted"
							icon="info-circle"
						/>
					</th>
					<td>
						{{ channel!.displayTitle }}
					</td>
				</tr>
				<tr>
					<th>
						{{ $gettext(`URL`) }}
						<AppJolticon
							v-app-tooltip.touchable="
								$gettext(`The jam's URL is the same as the channel's URL path.`)
							"
							class="text-muted"
							icon="info-circle"
						/>
					</th>
					<td>
						<router-link :to="{ name: 'communities.view.channel' }">
							{{ Environment.baseUrl + '/c/' + community!.path + '/'
							}}<b>{{ channel!.title }}</b>
						</router-link>
					</td>
				</tr>
				<tr>
					<th>
						{{ $gettext(`Timezone`) }}
					</th>
					<td>
						<template v-if="competition!.timezone">
							{{ competition!.timezone }}
							<p class="help-block sans-margin-bottom">
								{{ $gettext(`All jam times are based off this timezone.`) }}
							</p>
						</template>
						<template v-else>
							<span class="help-inline">
								<i>
									{{ $gettext(`No timezone selected`) }}
								</i>
							</span>
						</template>
					</td>
				</tr>
				<tr>
					<th>
						{{ $gettext(`Start date`) }}
					</th>
					<td>
						<AppCommunityCompetitionDate
							:date="competition!.starts_on"
							:timezone="competition!.timezone"
						/>
					</td>
				</tr>
				<tr>
					<th>
						{{ $gettext(`End date`) }}
					</th>
					<td>
						<AppCommunityCompetitionDate
							:date="competition!.ends_on"
							:timezone="competition!.timezone"
						/>
					</td>
				</tr>
				<tr v-if="competition!.is_voting_enabled">
					<th>
						{{ $gettext(`Voting end date`) }}
					</th>
					<td>
						<AppCommunityCompetitionDate
							:date="competition!.voting_ends_on"
							:timezone="competition!.timezone"
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
