<script lang="ts">
import { computed, provide, ref, watch } from 'vue';
import { RouteLocation, useRoute } from 'vue-router';
import { getParam, RouteLocationRedirect } from '../../../utils/router';
import { sleep } from '../../../utils/utils';
import { Api } from '../../../_common/api/api.service';
import AppIllustration from '../../../_common/illustration/AppIllustration.vue';
import AppCollectionButton from '../../../_common/inventory/AppCollectionButton.vue';
import {
	COLLECTION_TYPE_GAME,
	COLLECTION_TYPE_GAMEJOLT,
	COLLECTION_TYPE_USER,
} from '../../../_common/inventory/collection.model';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollScroller from '../../../_common/scroll/AppScrollScroller.vue';
import { commonStore } from '../../../_common/store/common-store';
import AppTabBar from '../../../_common/tab-bar/AppTabBar.vue';
import AppTabBarItem from '../../../_common/tab-bar/AppTabBarItem.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import AppUserCardHover from '../../../_common/user/card/AppUserCardHover.vue';
import { User } from '../../../_common/user/user.model';
import AppUserAvatarBubble from '../../components/user/AppUserAvatarBubble.vue';
import { illNoCommentsSmall } from '../../img/ill/illustrations';
import { CollectionsRouteStoreKey, createCollectionsRouteStore } from './collections.store';

export async function getRouteResolver(route: RouteLocation, url: string) {
	let username = route.params.username.toString().toLowerCase();

	// Check for trying to view your own collections.
	if (username === 'me') {
		// Not logged in, but tries to request "me" collections.
		// Could be that they navigated to this page directly, so we don't have the user yet.
		if (!commonStore.user.value) {
			await User.touch();
		}

		// If they are actually not logged in, redirect them to the login page.
		if (!commonStore.user.value) {
			return new RouteLocationRedirect({
				name: 'auth.login',
				query: { redirect: encodeURIComponent(route.fullPath) },
			});
		}

		username = '@' + commonStore.user.value.username;
	}

	url = '/web/inventory/collections/' + url.replace(':username', username);
	return Api.sendRequest(url);
}

export default {
	...defineAppRouteOptions({
		deps: { params: ['username'] },
		resolver: ({ route }) => getRouteResolver(route, ':username'),
	}),
	components: {
		AppTabBar,
		AppTabBarItem,
		AppScrollScroller,
		AppIllustration,
		AppUserCardHover,
		AppUserAvatarBubble,
		AppCollectionButton,
		AppJolticon,
	},
};
</script>

<script lang="ts" setup>
const routeStore = createCollectionsRouteStore();
const { collections, user, processPayload, viewingCollection } = routeStore;
provide(CollectionsRouteStoreKey, routeStore);
const route = useRoute();

// const body = ref<HTMLElement>();
const sidebar = ref<HTMLElement>();
const sidebarInner = ref<HTMLElement>();
const collectionList = ref<HTMLElement>();

const activeCollectionId = computed(() => {
	if (routingToId.value !== undefined) {
		return routingToId.value;
	}

	const collectionId = getParam(route, 'collectionId');
	if (collectionId) {
		return collectionId;
	}
});

const hasActiveCollection = computed(() => !!activeCollectionId.value);
const routingToId = ref<string>();

const showBody = computed(() => !!routingToId.value || hasActiveCollection.value);
const showSidebar = computed(() => !Screen.isMobile || !showBody.value);

watch(
	() => activeCollectionId.value,
	() => (routingToId.value = undefined)
);

function onSelect(collectionId: string) {
	if (activeCollectionId.value == collectionId) {
		return;
	}
	routingToId.value = collectionId;
}

async function onSidebarChange() {
	if (!sidebar.value || !sidebarInner.value) {
		return;
	}

	// Remove the sidebar transition while the browser is resizing.
	sidebarInner.value.style.transition = 'unset';
	sidebarInner.value.style.maxWidth = sidebar.value.offsetWidth + 'px';
	if (collectionList.value) {
		collectionList.value.style.maxWidth = sidebar.value.offsetWidth + 'px';
	}
	await sleep(0);
	sidebarInner.value.style.transition = '';
}

const activeTab = ref(COLLECTION_TYPE_GAMEJOLT);
const tabOptions = {
	[COLLECTION_TYPE_GAMEJOLT]: $gettext(`Game Jolt`),
	[COLLECTION_TYPE_USER]: $gettext(`Creators`),
	[COLLECTION_TYPE_GAME]: $gettext(`Games`),
};

const activeCollections = computed(() => {
	if (!collections.value) {
		return [];
	}
	return collections.value.filter(c => c.type === activeTab.value);
});

const isViewingSelf = computed(() => {
	if (!user.value) {
		return false;
	}
	return user.value.id === commonStore.user.value?.id;
});

// Watches the currently viewed collection, and changes the active tab to match.
// This is done so when directly routed to a specific collection, the correct tab
// is selected. When clicking on a collection from the collection list, the correct tab
// will always be selected.
watch(
	() => viewingCollection.value,
	() => {
		if (!viewingCollection.value) {
			return;
		}

		activeTab.value = viewingCollection.value.type;
	}
);

const routeTitle = computed(() => {
	const baseTitle = $gettext(`Browse Collections`);
	if (hasActiveCollection.value) {
		return (
			collections.value.find(i => i.id.toString() === activeCollectionId.value)?.name ||
			baseTitle
		);
	}
	return baseTitle;
});

createAppRoute({
	routeTitle,
	onResolved: ({ payload }) => processPayload(payload),
});
</script>

<template>
	<div class="_page">
		<div
			v-if="showSidebar"
			ref="sidebar"
			v-app-observe-dimensions="onSidebarChange"
			class="_sidebar"
			:class="{ _expanded: !showBody }"
		>
			<div ref="sidebarInner" class="_sidebar-inner">
				<div class="_sections-fade-top" />

				<AppScrollScroller class="_sections-scroller _pad-top" :thin="showBody">
					<div ref="collectionList" class="_collection-list">
						<div class="_collection-list-heading _pad-h">
							{{ $gettext(`Browse Collections`) }}
						</div>
						<div v-if="user" class="_pad-h">
							{{ $gettext(`for`) }}
							<AppUserCardHover :user="user" :block="false">
								<RouterLink :to="user.routeLocation" class="_user-name">
									<AppUserAvatarBubble
										:user="user"
										show-frame
										show-verified
										disable-link
										class="_user-avatar"
									/>
									{{ user.display_name }}
								</RouterLink>
							</AppUserCardHover>
						</div>

						<div class="_sections _pad-h _pad-bottom">
							<AppTabBar>
								<AppTabBarItem
									v-for="(title, key) of tabOptions"
									:key="key"
									:active="activeTab === key"
									@click="activeTab = key"
								>
									<AppJolticon
										v-if="key === COLLECTION_TYPE_GAMEJOLT"
										icon="gamejolt"
									/>
									<AppJolticon
										v-else-if="key === COLLECTION_TYPE_USER"
										icon="user"
									/>
									<AppJolticon
										v-else-if="key === COLLECTION_TYPE_GAME"
										icon="gamepad"
									/>
									{{ title }}
								</AppTabBarItem>
							</AppTabBar>

							<template v-if="activeCollections.length">
								<div v-for="collection of activeCollections" :key="collection.id">
									<AppCollectionButton
										:collection="collection"
										:user="user"
										:active="
											!Screen.isMobile &&
											viewingCollection?.id === collection.id
										"
										class="_collection-button"
										:class="{
											'_collection-button-active':
												// On mobile don't show active state, because we don't split the page.
												// When you can see this sidebar, you cannot see the active collection.
												!Screen.isMobile &&
												viewingCollection?.id === collection.id &&
												activeCollections.length > 1,
										}"
										@click="onSelect(collection.id.toString())"
									/>
								</div>
							</template>
							<template v-else>
								<AppIllustration :asset="illNoCommentsSmall" />
								<p class="text-center">
									<template v-if="isViewingSelf">
										{{
											$gettext(
												`You don't have any collections in this category.`
											)
										}}
									</template>
									<template v-else>
										{{
											$gettext(
												`This user doesn't have any collections in this category.`
											)
										}}
									</template>
								</p>
							</template>
						</div>
					</div>
				</AppScrollScroller>
				<div class="_sections-fade-bottom" />
			</div>
		</div>
		<div class="_body">
			<RouterView />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size-subheading = $font-size-small
$-padding = 40px

._page
	position: relative
	display: flex

._sidebar-inner
	change-bg(bg-offset)
	position: fixed
	left: var(--shell-left)
	top: var(--shell-top)
	width: calc(100% - var(--shell-left))
	bottom: 0
	display: flex
	justify-content: center
	z-index: 1

._sidebar
._sidebar-inner
	transition: max-width 500ms $weak-ease-out

._sidebar
._collection-list
	max-width: 500px

._sidebar
	flex: 1 1

	&._expanded
		._sidebar-inner
			max-width: 100% !important

		._collection-list
			max-width: 650px !important

		._collection-list-heading-text
			min-width: 100%


._user-name
	*
		vertical-align: middle

._user-avatar
	display: inline-block
	height: 20px
	width: 20px

._collection-list
	position: relative
	height: 100%
	flex: auto
	display: flex
	flex-direction: column
	height: fit-content

._pad-h
	padding-left: $-padding
	padding-right: $-padding

._pad-top
	padding-top: $-padding

._pad-bottom
	padding-bottom: $-padding

._empty
	display: flex
	flex-direction: column
	justify-content: center
	min-height: calc(70vh - var(--shell-top) - 40px)

._body
	position: relative
	flex: 2 1
	min-height: calc(100vh - var(--shell-top))

._collection-list-heading
	font-size: 27px
	font-family: $font-family-heading
	font-weight: bold
	display: flex

._collection-list-heading-text
	min-width: 80px
	text-align: center
	transition: min-width 500ms $weak-ease-out

._sections-scroller
	flex: auto
	display: flex
	justify-content: center
	max-height: calc(100vh - var(--shell-top))

._sections-fade-top
._sections-fade-bottom
	position: absolute
	left: 0
	right: 0
	z-index: 1
	height: 16px

._sections-fade-top
	top: 0
	background-image: unquote('linear-gradient(to top, transparent, rgba(var(--theme-bg-offset-rgb), 0.5))')

._sections-fade-bottom
	bottom: 0
	background-image: unquote('linear-gradient(to bottom, transparent, rgba(var(--theme-bg-offset-rgb), 0.5))')

._sections
	display: flex
	flex-direction: column
	grid-gap: 16px

._collection-button
	elevate-hover-1()
	transition: transform ease 0.1s

._collection-button-active
	transform: translateX(16px)
</style>
