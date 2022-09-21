<script lang="ts">
import { watch } from '@vue/runtime-core';
import { computed, ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { getParam } from '../../../utils/router';
import { sleep } from '../../../utils/utils';
import { Api } from '../../../_common/api/api.service';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import AppQuestLogItem from '../../../_common/quest/AppQuestLogItem.vue';
import { Quest } from '../../../_common/quest/quest-model';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';
import AppSpacer from '../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import AppDailyQuests from '../../components/quest/AppDailyQuests.vue';
import { illNoComments, illNoCommentsSmall } from '../../img/ill/illustrations';
import { useQuestStore } from '../../store/quest';

export default {
	...defineAppRouteOptions({
		deps: {},
		lazy: true,
		resolver: async () =>
			Api.sendFieldsRequest('/mobile/quest', {
				quests: true,
				dailyQuests: true,
			}),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const {
	isLoading,
	hasLoaded,
	assignQuests,
	dailyQuests,
	quests,
	allQuests,
	newQuestIds,
	questActivityIds,
	clearNewQuestIds,
	clearQuestActivityIds,
} = useQuestStore();

const body = ref<HTMLElement>();
const sidebar = ref<HTMLElement>();
const sidebarInner = ref<HTMLElement>();
const questList = ref<HTMLElement>();

const activeQuestId = computed(() => {
	if (routingToId.value !== undefined) {
		return routingToId.value;
	}

	const questId = getParam(route, 'id');
	if (questId) {
		return parseInt(questId, 10);
	}
});

const hasActiveQuest = computed(() => !!activeQuestId.value);
const routingToId = ref<number>();

const showBody = computed(() => !!routingToId.value || hasActiveQuest.value);
const showSidebar = computed(() => !Screen.isMobile || !showBody.value);

const hasQuests = computed(() => dailyQuests.value.length > 0 || quests.value.length > 0);

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

const routeTitle = computed(() => {
	const baseTitle = 'My Quests';
	if (hasActiveQuest.value) {
		return quests.value.find(i => i.id === activeQuestId.value)?.title || baseTitle;
	}
	return baseTitle;
});

const { isBootstrapped } = createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		const newQuests: Quest[] = [];
		if (payload.quests) {
			newQuests.push(
				...Quest.populate(payload.quests).filter((i: Quest) => {
					// We may get both daily quests and other quests when
					// requesting `quests`, but that may not include daily
					// quests that are in a completed state.
					//
					// Filter out any daily quests from here and insert the
					// result from the `dailyQuests` field instead.
					return !i.isDaily;
				})
			);
		}
		if (payload.dailyQuests) {
			// Insert the daily quests to the front of our new quests.
			newQuests.unshift(...Quest.populate(payload.dailyQuests));
		}

		assignQuests(newQuests);
		isLoading.value = false;
		hasLoaded.value = true;
		clearUnknownWatermarks();
	},
});

function clearUnknownWatermarks() {
	const _newIds = [...newQuestIds.value.values()];
	const _activityIds = [...questActivityIds.value.values()];
	const _currentQuestIds = new Set(allQuests.value.map(i => i.id));

	for (const id of _newIds) {
		if (!_currentQuestIds.has(id)) {
			clearNewQuestIds([id], { pushView: false });
		}
	}

	for (const id of _activityIds) {
		if (!_currentQuestIds.has(id)) {
			clearQuestActivityIds([id], { pushView: false });
		}
	}

	_currentQuestIds.clear();
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
				<div class="-sections-fade-top" />

				<AppScrollScroller class="-sections-scroller -pad-top" :thin="showBody">
					<div ref="questList" class="-quest-list">
						<div class="-quest-list-heading -pad-h">
							<AppTranslate class="-quest-list-heading-text">My Quests</AppTranslate>
						</div>

						<AppSpacer vertical :scale="10" />

						<div class="-sections -pad-h -pad-bottom">
							<AppDailyQuests
								v-if="!isBootstrapped || dailyQuests.length > 0"
								:active-quest-id="activeQuestId"
								show-charge
								:constrain-charge-tooltip="showBody"
							>
								<template #header>
									<div class="-subheading">
										<AppTranslate>Daily Quests</AppTranslate>
									</div>
								</template>
							</AppDailyQuests>

							<template v-if="!isBootstrapped">
								<!-- Active Quests -->
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
										:asset="Screen.isXs ? illNoCommentsSmall : illNoComments"
									>
										<AppTranslate> You have no active quests </AppTranslate>
									</AppIllustration>
								</div>
							</template>
							<template v-else>
								<!-- Active Quests -->
								<div v-if="quests.length > 0">
									<div class="-subheading">
										<AppTranslate>Active Quests</AppTranslate>
									</div>

									<AppSpacer vertical :scale="4" />

									<div class="-col">
										<AppQuestLogItem
											v-for="quest of quests"
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
				</AppScrollScroller>
				<div class="-sections-fade-bottom" />
			</div>
		</div>

		<div ref="body" class="-body">
			<RouterView />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size-subheading = $font-size-small
$-padding = 40px

.-page
	position: relative
	display: flex

.-sidebar-inner
	change-bg(bg-offset)
	position: fixed
	left: var(--shell-left)
	top: var(--shell-top)
	width: calc(100% - var(--shell-left))
	bottom: 0
	display: flex
	justify-content: center
	z-index: 1

.-sidebar
.-sidebar-inner
	transition: max-width 500ms $weak-ease-out

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
	height: 100%
	flex: auto
	display: flex
	flex-direction: column
	height: fit-content

.-pad-h
	padding-left: $-padding
	padding-right: $-padding

.-pad-top
	padding-top: $-padding

.-pad-bottom
	padding-bottom: $-padding

.-empty
	display: flex
	flex-direction: column
	justify-content: center
	min-height: calc(70vh - var(--shell-top) - 40px)

.-body
	position: relative
	flex: 2 1
	min-height: calc(100vh - var(--shell-top))

.-quest-list-heading
	font-size: 27px
	font-family: $font-family-heading
	font-weight: bold
	display: flex

.-quest-list-heading-text
	min-width: 80px
	text-align: center
	transition: min-width 500ms $weak-ease-out

.-sections-scroller
	flex: auto
	display: flex
	justify-content: center
	max-height: calc(100vh - var(--shell-top))

.-sections-fade-top
.-sections-fade-bottom
	position: absolute
	left: 0
	right: 0
	z-index: 1
	height: 16px

.-sections-fade-top
	top: 0
	background-image: unquote('linear-gradient(to top, transparent, rgba(var(--theme-bg-offset-rgb), 0.5))')

.-sections-fade-bottom
	bottom: 0
	background-image: unquote('linear-gradient(to bottom, transparent, rgba(var(--theme-bg-offset-rgb), 0.5))')

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
