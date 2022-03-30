<script lang="ts">
import { watch } from '@vue/runtime-core';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getParam } from '../../../utils/router';
import { sleep } from '../../../utils/utils';
import { Api } from '../../../_common/api/api.service';
import AppLoading from '../../../_common/loading/loading.vue';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import AppQuestLogItem from '../../../_common/quest/AppQuestLogItem.vue';
import { Quest } from '../../../_common/quest/quest-model';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { useAppStore } from '../../store/index';

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

const ShellTopNavHeight = 56;
</script>

<script lang="ts" setup>
const route = useRoute();
const appStore = useAppStore();

const quests = ref<Quest[]>([]);
const body = ref<HTMLElement>();
const sidebar = ref<HTMLElement>();
const sidebarInner = ref<HTMLElement>();
const questList = ref<HTMLElement>();

const activeQuestId = computed(() => {
	const questId = getParam(route, 'id');
	return questId ? parseInt(questId, 10) : null;
});

const hasActiveQuest = computed(() => !!activeQuestId.value);
const isRouting = ref(false);

const showBody = computed(() => isRouting.value || hasActiveQuest.value);
const showSidebar = computed(() => !Screen.isMobile || !showBody.value);

watch(
	() => activeQuestId.value,
	() => (isRouting.value = false)
);

function onSelect(id: number) {
	if (activeQuestId.value == id) {
		return;
	}
	isRouting.value = true;
}

async function onSidebarChange() {
	if (!sidebar.value || !sidebarInner.value) {
		return;
	}

	// TODO(quests) I'm trying to remove the sidebar transition while the browser is resizing.
	sidebarInner.value.style.transition = 'unset';
	sidebarInner.value.style.maxWidth = sidebar.value.offsetWidth + 'px';
	await sleep(0);
	sidebarInner.value.style.transition = '';
}

function onQuestListChange() {
	if (!body.value || !questList.value) {
		return;
	}
	const sidebarHeight = questList.value.offsetHeight;
	body.value.style.minHeight = `calc(max(100vh - ${ShellTopNavHeight}px, ${sidebarHeight}px))`;
}

createAppRoute({
	routeTitle: `My Quests`,
	onResolved({ payload }) {
		quests.value = Quest.populate(payload.quests);
		clearUnknownWatermarks();
	},
});

function clearUnknownWatermarks() {
	const c = appStore;

	const _newIds = { ...c.newQuestIds.value };
	const _activityIds = { ...c.questActivityIds.value };
	const _currentQuestIds: typeof c.newQuestIds.value = {};
	quests.value.forEach(i => (_currentQuestIds[i.id] = true));

	for (const id of Object.keys(_newIds)) {
		const questId = parseInt(id, 10);
		if (_currentQuestIds[questId] !== true) {
			c.clearNewQuestIds([questId], { pushView: false });
		}
	}

	for (const id of Object.keys(_activityIds)) {
		const questId = parseInt(id, 10);
		if (_currentQuestIds[questId] !== true) {
			c.clearQuestActivityIds([questId], { pushView: false });
		}
	}
}
</script>

<template>
	<div class="-page">
		<div
			v-if="showSidebar"
			ref="sidebar"
			v-app-observe-dimensions="onSidebarChange"
			class="-sidebar"
			:class="{ '-expanded': !showBody }"
		>
			<div ref="sidebarInner" class="-sidebar-inner">
				<div
					ref="questList"
					v-app-observe-dimensions="onQuestListChange"
					class="-quest-list"
				>
					<div class="-quest-list-heading">
						<AppTranslate class="-quest-list-heading-text">My Quests</AppTranslate>
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
						@goto="onSelect"
					/>
				</div>
			</div>
		</div>

		<div ref="body" class="-body">
			<!-- TODO(quests) should we show placeholders here or in the RouterView? -->
			<RouterView />
			<div
				v-if="!hasActiveQuest"
				style="
					position: absolute;
					height: 100%;
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
				"
			>
				<AppLoading centered hide-label />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-page
	position: relative
	display: flex

	// > *
	// 	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

.-sidebar-inner
	display: flex
	position: absolute
	left: 0
	top: 0
	bottom: 0
	width: 100%
	background-color: var(--theme-bg-offset)
	display: flex
	justify-content: center
	z-index: 1

.-sidebar
.-sidebar-inner
.-quest-list
	transition: max-width 500ms $weak-ease-out

.-sidebar
.-quest-list
	max-width: 500px

.-sidebar
	flex: 1 1

	&.-expanded
		.-sidebar-inner
			max-width: 100% !important

		.-quest-list-heading-text
			min-width: 100%

		.-quest-list
			max-width: 650px

.-quest-list
	padding: 40px
	flex: auto
	height: fit-content

.-body
	position: relative
	flex: 2 1

.-quest-list-heading
	font-size: 24px
	font-family: $font-family-heading
	font-weight: bold
	display: flex

.-quest-list-heading-text
	min-width: 80px
	text-align: center
	transition: min-width 500ms $weak-ease-out


.-subheading
	font-size: $font-size-small
	text-transform: uppercase
	color: var(--theme-fg-muted)
</style>
