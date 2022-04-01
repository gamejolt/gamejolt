<script lang="ts">
import { watch } from '@vue/runtime-core';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getParam } from '../../../utils/router';
import { sleep } from '../../../utils/utils';
import { Api } from '../../../_common/api/api.service';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../_common/loading/loading.vue';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import AppQuestLogItem from '../../../_common/quest/AppQuestLogItem.vue';
import { Quest } from '../../../_common/quest/quest-model';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { illNoComments, illNoCommentsSmall } from '../../img/ill/illustrations';
import { useAppStore } from '../../store/index';

export default {
	...defineAppRouteOptions({
		deps: {},
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
	if (!body.value) {
		return;
	}

	const sidebarHeight = questList.value?.offsetHeight ?? 0;
	if (Screen.height - ShellTopNavHeight > sidebarHeight) {
		body.value.style.minHeight = `calc(100vh - ${ShellTopNavHeight}px)`;
	} else {
		body.value.style.minHeight = `calc(max(100vh - ${ShellTopNavHeight}px, ${sidebarHeight}px))`;
	}
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

function onNewQuest(data: Quest) {
	const index = quests.value.findIndex(i => i.id === data.id);
	if (index === -1) {
		illNoComments;
		return;
	}
	quests.value.splice(index, 1, data);
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
				<div ref="questList" class="-quest-list">
					<div
						v-app-observe-dimensions="onQuestListChange"
						class="-quest-list-observer"
					/>

					<div class="-quest-list-heading">
						<AppTranslate class="-quest-list-heading-text">My Quests</AppTranslate>
					</div>

					<AppSpacer vertical :scale="10" />

					<!-- TODO(quests) daily, weekly, other quests -->
					<template v-if="quests.length > 0">
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
					</template>
					<template v-else>
						<div class="-empty">
							<AppIllustration
								:src="Screen.isXs ? illNoCommentsSmall : illNoComments"
							>
								<AppTranslate> You have no active quests </AppTranslate>
							</AppIllustration>
						</div>
					</template>
				</div>
			</div>
		</div>

		<div ref="body" class="-body">
			<RouterView @new-quest="onNewQuest" />
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

.-sidebar-inner
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

.-quest-list-observer
	position: absolute
	left: 0
	top: 0
	height: 100%
	width: 0px
	flex: none

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
	position: relative
	padding: 40px
	flex: auto
	height: fit-content

.-empty
	min-height: 'calc(70vh - %s - 40px)' % $shell-top-nav-height
	display: flex
	flex-direction: column
	justify-content: center

.-body
	position: relative
	flex: 2 1
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

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
