<script lang="ts">
import { Inject, Options, Vue } from 'vue-property-decorator';
import { CompetitionPeriodVoting } from '../../../../../../../../../_common/community/competition/competition.model';
import { formatNumber } from '../../../../../../../../../_common/filters/number';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../../view.store';

@Options({})
export default class AppCommunitiesEditCompetitionNav extends Vue {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

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
				<app-jolticon icon="info-circle" />
				<translate>Overview</translate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.settings',
				}"
				active-class="active"
			>
				<app-jolticon icon="edit" />
				<translate>Edit</translate>
			</router-link>
		</li>
		<li>
			<router-link
				:to="{
					name: 'communities.view.edit.channels.competition.voting',
				}"
				active-class="active"
			>
				<app-jolticon icon="pedestals-numbers" />
				<translate>Voting</translate>
				&nbsp;
				<span v-if="competition.is_voting_enabled" class="tag tag-highlight">
					<translate>On</translate>
				</span>
				<span v-else class="tag">
					<translate>Off</translate>
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
				<app-jolticon icon="game" />
				<translate>Entries</translate>
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
				<app-jolticon icon="medal" />
				<translate>Assign Awards</translate>
			</router-link>
		</li>
	</ul>
</template>
