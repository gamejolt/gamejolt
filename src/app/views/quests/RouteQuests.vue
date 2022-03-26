<script lang="ts">
import { computed, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { getParam } from '../../../utils/router';
import { Api } from '../../../_common/api/api.service';
import AppQuestLogItem from '../../../_common/quest/AppQuestLogItem.vue';
import { Quest } from '../../../_common/quest/quest-model';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';

export default {
	...defineAppRouteOptions({
		resolver: async () =>
			Api.sendRequest(
				'/mobile/quest',
				{
					_fields: {
						quests: true,
					},
				},
				{
					sanitizeComplexData: false,
				}
			),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();

const quests = ref<Quest[]>([]);

const activeQuestId = computed(() => {
	const questId = getParam(route, 'id');
	return questId ? parseInt(questId, 10) : null;
});

const hasActiveQuest = computed(() => !!activeQuestId.value);

createAppRoute({
	routeTitle: computed(() => `My Quests`),
	onResolved({ payload }) {
		quests.value = Quest.populate(payload.quests);
	},
});
</script>

<template>
	<div class="-page">
		<div class="-quest-list" :class="{ '-expanded': !hasActiveQuest }">
			<div class="-quest-list-heading">
				<AppTranslate>My Quests</AppTranslate>
			</div>

			<AppSpacer vertical :scale="10" />

			<div class="-subheading">
				<AppTranslate>Active Quests</AppTranslate>
			</div>

			<AppSpacer vertical :scale="4" />

			<AppQuestLogItem
				v-for="quest of quests"
				:key="quest.id"
				:quest="quest"
				:active="activeQuestId === quest.id"
			/>
		</div>
		<div class="-body">
			<RouterView />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-page
	display: flex
	flex-direction: row
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

.-quest-list
	flex: 1 1
	max-width: 500px
	background-color: var(--theme-bg-offset)
	padding: 40px

.-body
	flex: 2 1

.-quest-list-heading
	font-size: 24px
	font-family: $font-family-heading
	font-weight: bold

.-subheading
	font-size: $font-size-small
	text-transform: uppercase
	color: var(--theme-fg-muted)
</style>
