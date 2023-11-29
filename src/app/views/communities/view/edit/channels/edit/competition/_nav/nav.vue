<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { CompetitionPeriodVoting } from '../../../../../../../../../_common/community/competition/competition.model';
import { formatNumber } from '../../../../../../../../../_common/filters/number';
import { useCommunityRouteStore } from '../../../../../view.store';

@Options({})
export default class AppCommunitiesEditCompetitionNav extends Vue {
	routeStore = setup(() => useCommunityRouteStore())!;

	readonly formatNumber = formatNumber;

	get competition() {
		return this.routeStore.competition!;
	}

	get canAssignAwards() {
		return (
			this.competition.is_voting_enabled &&
			this.competition.has_awards &&
			this.competition.periodNum >= CompetitionPeriodVoting
		);
	}
}
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
