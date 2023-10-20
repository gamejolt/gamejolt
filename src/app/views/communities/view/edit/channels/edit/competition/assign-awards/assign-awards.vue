<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { CommunityCompetitionAwardModel } from '../../../../../../../../../_common/community/competition/award/award.model';
import AppLoading from '../../../../../../../../../_common/loading/AppLoading.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';

type Payload = {
	awards: any[];
};

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionAssignAwards',
	components: {
		AppLoading,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['id', 'channel'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			`/web/dash/communities/competitions/awards/${route.params.id}/${route.params.channel}`
		),
})
export default class RouteCommunitiesViewEditChannelsCompetitionAssignAwards extends LegacyRouteComponent {
	awards: CommunityCompetitionAwardModel[] = [];
	isLoading = true;

	get selectedAwardId() {
		const id = this.$route.params.awardId;
		if (typeof id === 'string') {
			return parseInt(id, 10);
		} else if (typeof id === 'number') {
			return id;
		}
	}

	get noAwardSelected() {
		return !this.selectedAwardId;
	}

	routeResolved($payload: Payload) {
		this.awards = CommunityCompetitionAwardModel.populate($payload.awards);

		this.isLoading = false;
	}

	isAwardSelected(award: CommunityCompetitionAwardModel) {
		return this.selectedAwardId === award.id;
	}

	onAssignAward(awardId: number) {
		const award = this.awards.find(i => i.id === awardId);
		if (award) {
			if (award.entry_count === null) {
				award.entry_count = 1;
			} else {
				award.entry_count++;
			}
		}
	}

	onUnassignAward(awardId: number) {
		const award = this.awards.find(i => i.id === awardId);
		if (award && award.entry_count !== null) {
			award.entry_count--;
		}
	}
}
</script>

<template>
	<div>
		<h2 class="sans-margin-top"><AppTranslate>Assign Awards</AppTranslate></h2>

		<template v-if="isLoading">
			<AppLoading centered />
		</template>

		<template v-else-if="awards.length === 0">
			<div class="alert">
				<p>
					<AppTranslate>
						You have created no awards for this jam yet. Go over to the Voting section
						to create awards.
					</AppTranslate>
				</p>
				<AppButton
					icon="edit"
					:to="{ name: 'communities.view.edit.channels.competition.voting' }"
				>
					<AppTranslate>Create Awards</AppTranslate>
				</AppButton>
			</div>
		</template>

		<template v-else>
			<p v-if="noAwardSelected">
				<AppTranslate>
					These are the awards you've created. Select an award below to choose which
					entries to give it to.
				</AppTranslate>
			</p>

			<div class="-award-list">
				<AppButton
					v-for="award of awards"
					:key="award.id"
					class="-award"
					:solid="isAwardSelected(award)"
					:primary="isAwardSelected(award)"
					icon="medal"
					:to="{
						name: 'communities.view.edit.channels.competition.assign-awards.award',
						params: { awardId: award.id },
					}"
					:badge="(award.entry_count || 0).toString()"
				>
					{{ award.name }}
				</AppButton>
			</div>

			<router-view @assign="onAssignAward($event)" @unassign="onUnassignAward($event)" />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-award-list
	display: flex
	flex-wrap: wrap

.-award
	margin-right: 16px
	margin-bottom: 16px
</style>
