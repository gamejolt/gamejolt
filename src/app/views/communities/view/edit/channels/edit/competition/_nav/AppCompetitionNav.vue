<script lang="ts" setup>
import AppJolticon from '../../../../../../../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../../../../../../../_common/translate/AppTranslate.vue';
import { computed } from 'vue';
import { CompetitionPeriodVoting } from '../../../../../../../../../_common/community/competition/competition.model';
import { formatNumber } from '../../../../../../../../../_common/filters/number';
import { useCommunityRouteStore } from '../../../../../view.store';

const routeStore = useCommunityRouteStore()!;

const competition = computed(() => routeStore.competition!);

const canAssignAwards = computed(
	() =>
		competition.value.is_voting_enabled &&
		competition.value.has_awards &&
		competition.value.periodNum >= CompetitionPeriodVoting
);
</script>

<template>
	<ul>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.overview',
				}"
				exact-active-class="active"
			>
				<AppJolticon icon="info-circle" />
				<AppTranslate>Overview</AppTranslate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.settings',
				}"
				active-class="active"
			>
				<AppJolticon icon="edit" />
				<AppTranslate>Edit</AppTranslate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.voting',
				}"
				active-class="active"
			>
				<AppJolticon icon="pedestals-numbers" />
				<AppTranslate>Voting</AppTranslate>
				&nbsp;
				<span v-if="competition.is_voting_enabled" class="tag tag-highlight">
					<AppTranslate>On</AppTranslate>
				</span>
				<span v-else class="tag">
					<AppTranslate>Off</AppTranslate>
				</span>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.entries',
				}"
				active-class="active"
			>
				<AppJolticon icon="gamepad" />
				<AppTranslate>Entries</AppTranslate>
				&nbsp;
				<span class="tag">
					{{ formatNumber(competition.entry_count) }}
				</span>
			</router-link>
		</li>
		<li v-if="canAssignAwards">
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.assign-awards',
				}"
				active-class="active"
			>
				<AppJolticon icon="medal" />
				<AppTranslate>Assign Awards</AppTranslate>
			</router-link>
		</li>
	</ul>
</template>
