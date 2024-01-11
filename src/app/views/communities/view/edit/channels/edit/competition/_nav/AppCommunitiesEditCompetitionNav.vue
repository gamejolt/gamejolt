<script lang="ts" setup>
import { toRef } from 'vue';
import { CompetitionPeriodVoting } from '../../../../../../../../../_common/community/competition/competition.model';
import { formatNumber } from '../../../../../../../../../_common/filters/number';
import AppJolticon from '../../../../../../../../../_common/jolticon/AppJolticon.vue';
import { useCommunityRouteStore } from '../../../../../view.store';

const { competition } = useCommunityRouteStore()!;

const canAssignAwards = toRef(
	() =>
		competition.value!.is_voting_enabled &&
		competition.value!.has_awards &&
		competition.value!.periodNum >= CompetitionPeriodVoting
);
</script>

<template>
	<ul>
		<li>
			<RouterLink
				:to="{
					name: 'communities.view.edit.channels.competition.overview',
				}"
				exact-active-class="active"
			>
				<AppJolticon icon="info-circle" />
				{{ $gettext(`Overview`) }}
			</RouterLink>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'communities.view.edit.channels.competition.settings',
				}"
				active-class="active"
			>
				<AppJolticon icon="edit" />
				{{ $gettext(`Edit`) }}
			</RouterLink>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'communities.view.edit.channels.competition.voting',
				}"
				active-class="active"
			>
				<AppJolticon icon="pedestals-numbers" />
				{{ $gettext(`Voting`) }}
				&nbsp;
				<span v-if="competition!.is_voting_enabled" class="tag tag-highlight">
					{{ $gettext(`On`) }}
				</span>
				<span v-else class="tag">
					{{ $gettext(`Off`) }}
				</span>
			</RouterLink>
		</li>
		<li>
			<RouterLink
				:to="{
					name: 'communities.view.edit.channels.competition.entries',
				}"
				active-class="active"
			>
				<AppJolticon icon="gamepad" />
				{{ $gettext(`Entries`) }}
				&nbsp;
				<span class="tag">
					{{ formatNumber(competition!.entry_count) }}
				</span>
			</RouterLink>
		</li>
		<li v-if="canAssignAwards">
			<RouterLink
				:to="{
					name: 'communities.view.edit.channels.competition.assign-awards',
				}"
				active-class="active"
			>
				<AppJolticon icon="medal" />
				{{ $gettext(`Assign Awards`) }}
			</RouterLink>
		</li>
	</ul>
</template>
