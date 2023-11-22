<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../../../_common/button/AppButton.vue';
import { CommunityCompetitionAwardModel } from '../../../../../../../../../_common/community/competition/award/award.model';
import AppLoading from '../../../../../../../../../_common/loading/AppLoading.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		deps: { params: ['id', 'channel'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				`/web/dash/communities/competitions/awards/${route.params.id}/${route.params.channel}`
			),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();

const awards = ref<CommunityCompetitionAwardModel[]>([]);
const isLoading = ref(true);

const noAwardSelected = toRef(() => !selectedAwardId.value);

const selectedAwardId = computed(() => {
	const id = route.params.awardId;
	if (typeof id === 'string') {
		return parseInt(id, 10);
	} else if (typeof id === 'number') {
		return id;
	}
});

function isAwardSelected(award: CommunityCompetitionAwardModel) {
	return selectedAwardId.value === award.id;
}

function onAssignAward(awardId: number) {
	const currAward = awards.value.find(i => i.id === awardId);
	if (currAward) {
		if (currAward.entry_count === null) {
			currAward.entry_count = 1;
		} else {
			currAward.entry_count++;
		}
	}
}

function onUnassignAward(awardId: number) {
	const currAward = awards.value.find(i => i.id === awardId);
	if (currAward && currAward.entry_count !== null) {
		currAward.entry_count--;
	}
}

createAppRoute({
	routeTitle: computed(() => ``),
	onResolved({ payload }) {
		awards.value = CommunityCompetitionAwardModel.populate(payload.awards);
		isLoading.value = false;
	},
});
</script>

<template>
	<div>
		<h2 class="sans-margin-top">
			{{ $gettext(`Assign Awards`) }}
		</h2>

		<template v-if="isLoading">
			<AppLoading centered />
		</template>

		<template v-else-if="awards.length === 0">
			<div class="alert">
				<p>
					{{
						$gettext(`You have created no awards for this jam yet. Go over to the Voting section
						to create awards.`)
					}}
				</p>
				<AppButton
					icon="edit"
					:to="{ name: 'communities.view.edit.channels.competition.voting' }"
				>
					{{ $gettext(`Create Awards`) }}
				</AppButton>
			</div>
		</template>

		<template v-else>
			<p v-if="noAwardSelected">
				{{
					$gettext(`These are the awards you've created. Select an award below to choose which
					entries to give it to.`)
				}}
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
			<!--TODO(component-setup-refactor-routes-0): revisit error below@
			Type '{ onAssign: any; onUnassign: any; }' has no properties in common with type 'AllowedComponentProps & ...-->
			<RouterView @assign="onAssignAward($event)" @unassign="onUnassignAward($event)" />
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
