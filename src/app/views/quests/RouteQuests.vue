<script lang="ts">
import { watch } from '@vue/runtime-core';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getParam } from '../../../utils/router';
import { sleep } from '../../../utils/utils';
import { Api } from '../../../_common/api/api.service';
import { AppCountdown } from '../../../_common/countdown/countdown';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import AppQuestLogItem from '../../../_common/quest/AppQuestLogItem.vue';
import { Quest, QuestRepeatType } from '../../../_common/quest/quest-model';
import { useQuestStore } from '../../../_common/quest/quest-store';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { illNoComments, illNoCommentsSmall } from '../../img/ill/illustrations';
import { useAppStore } from '../../store/index';

export default {
	...defineAppRouteOptions({
		deps: {},
		lazy: true,
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
const { isLoading, hasLoaded, addQuests, quests } = useQuestStore();

const body = ref<HTMLElement>();
const sidebar = ref<HTMLElement>();
const sidebarInner = ref<HTMLElement>();
const questList = ref<HTMLElement>();

const dailyQuests = computed(() =>
	quests.value.filter(i => i.repeat_type === QuestRepeatType.daily)
);

const activeQuests = computed(() =>
	quests.value.filter(i => i.repeat_type !== QuestRepeatType.daily)
);

const showLoading = computed(() => !hasLoaded.value && isLoading.value);

const activeQuestId = computed(() => {
	if (routingToId.value !== undefined) {
		return routingToId.value;
	}

	const questId = getParam(route, 'id');
	return questId ? parseInt(questId, 10) : null;
});

const hasActiveQuest = computed(() => !!activeQuestId.value);
const routingToId = ref<number>();

const showBody = computed(() => routingToId.value || hasActiveQuest.value);
const showSidebar = computed(() => !Screen.isMobile || !showBody.value);

const hasDailyQuests = computed(() => dailyQuests.value.length > 0);
const hasActiveQuests = computed(() => activeQuests.value.length > 0);

const hasQuests = computed(() => hasDailyQuests.value || hasActiveQuests.value);

watch(
	() => activeQuestId.value,
	() => (routingToId.value = undefined)
);

function onSelect(id: number) {
	if (activeQuestId.value == id) {
		return;
	}
	routingToId.value = id;
}

async function onSidebarChange() {
	if (!sidebar.value || !sidebarInner.value) {
		return;
	}

	// Remove the sidebar transition while the browser is resizing.
	sidebarInner.value.style.transition = 'unset';
	sidebarInner.value.style.maxWidth = sidebar.value.offsetWidth + 'px';
	if (questList.value) {
		questList.value.style.maxWidth = sidebar.value.offsetWidth + 'px';
	}
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

const routeTitle = computed(() => {
	const baseTitle = 'My Quests';
	if (hasActiveQuest.value) {
		return quests.value.find(i => i.id === activeQuestId.value)?.title || baseTitle;
	}
	return baseTitle;
});

createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		const newQuests: Quest[] = [];
		if (payload.dailyQuests) {
			newQuests.push(...Quest.populate(payload.dailyQuests));
		}
		if (payload.quests) {
			newQuests.push(...Quest.populate(payload.quests));
		}

		addQuests(newQuests, { overwrite: true });
		isLoading.value = false;
		hasLoaded.value = true;
		clearUnknownWatermarks();
	},
});

function clearUnknownWatermarks() {
	const c = appStore;

	const _newIds = [...c.newQuestIds.value.values()];
	const _activityIds = [...c.questActivityIds.value.values()];
	const _currentQuestIds = new Set(quests.value.map(i => i.id));

	for (const id of _newIds) {
		if (!_currentQuestIds.has(id)) {
			c.clearNewQuestIds([id], { pushView: false });
		}
	}

	for (const id of _activityIds) {
		if (!_currentQuestIds.has(id)) {
			c.clearQuestActivityIds([id], { pushView: false });
		}
	}

	_currentQuestIds.clear();
}

function onNewQuest(data: Quest) {
	const index = quests.value.findIndex(i => i.id === data.id);
	if (index === -1) {
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

					<div class="-sections">
						<template v-if="showLoading">
							<div>
								<div class="-placeholder -placeholder-subheading" />
								<AppSpacer vertical :scale="4" />
								<div class="-grid">
									<div
										v-for="i of 3"
										:key="i"
										class="-placeholder -placeholder-daily"
									/>
								</div>
							</div>

							<div>
								<div class="-placeholder -placeholder-subheading" />
								<AppSpacer vertical :scale="4" />
								<div class="-col">
									<div
										v-for="i of 1"
										:key="i"
										class="-placeholder -placeholder-tile"
									/>
								</div>
							</div>
						</template>
						<template v-else-if="!hasQuests">
							<div class="-empty">
								<AppIllustration
									:src="Screen.isXs ? illNoCommentsSmall : illNoComments"
								>
									<AppTranslate> You have no active quests </AppTranslate>
								</AppIllustration>
							</div>
						</template>
						<template v-else>
							<!-- TODO(quests) daily, weekly, other quests -->
							<div v-if="hasDailyQuests">
								<div class="-subheading -row">
									<AppTranslate>Daily Quests</AppTranslate>
									<div v-if="dailyQuests[0].ends_on" class="-countdown">
										<!-- TODO(quests) clock jolticon -->
										<AppJolticon icon="radio-circle" />
										<!-- TODO(quests) daily quests, AppTimeAgo, better countdown timer -->
										<AppCountdown :end="dailyQuests[0].ends_on" />
									</div>
								</div>

								<AppSpacer vertical :scale="4" />

								<div class="-grid">
									<AppQuestLogItem
										v-for="quest of dailyQuests"
										:key="quest.id"
										:quest="quest"
										:active="activeQuestId === quest.id"
										compact-stack
										@goto="onSelect"
									/>
								</div>
							</div>

							<div v-if="hasActiveQuests">
								<div class="-subheading">
									<AppTranslate>Active Quests</AppTranslate>
								</div>

								<AppSpacer vertical :scale="4" />

								<div class="-col">
									<AppQuestLogItem
										v-for="quest of activeQuests"
										:key="quest.id"
										:quest="quest"
										:active="activeQuestId === quest.id"
										@goto="onSelect"
									/>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
		</div>

		<div ref="body" class="-body">
			<RouterView @new-quest="onNewQuest" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size-subheading = $font-size-small

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

		.-quest-list
			max-width: 650px !important

		.-quest-list-heading-text
			min-width: 100%

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

.-sections
	display: flex
	flex-direction: column
	grid-gap: 40px

.-subheading
	font-size: $-font-size-subheading
	text-transform: uppercase
	color: var(--theme-fg-muted)

.-countdown
	margin-left: auto
	display: inline-flex
	align-items: center

	&
	.jolticon
		font-size: $font-size-tiny

.-placeholder
	background-color: var(--theme-bg-subtle)
	rounded-corners-lg()

.-placeholder-subheading
	width: 120px
	height: floor($-font-size-subheading * $line-height-base)


.-grid
.-row
.-col
	grid-gap: 8px 16px

.-grid
	display: grid
	grid-template-columns: repeat(3, minmax(0, 1fr))

.-row
.-col
	display: flex

.-row
	flex-direction: row

.-col
	flex-direction: column

.-placeholder-daily
	display: flex
	height: 150px
	flex: auto

.-placeholder-tile
	width: 100%
	height: 120px
</style>
