<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { Connection } from '../../../../_common/connection/connection-service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/loading.vue';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { UserFriendship } from '../../../../_common/user/friendship/friendship.model';
import { useAppStore } from '../../../store';
import { UserFriendshipHelper } from '../../user/friendships-helper/friendship-helper.service';
import AppShellFriendRequestPopoverItem from './AppShellFriendRequestPopoverItem.vue';

type Tab = 'requests' | 'pending';

const { hasNewFriendRequests, grid } = useAppStore();

const isShowing = ref(false);
const isLoading = ref(false);
const perPage = ref(50);
const isBootstrapped = ref(false);

const activeTab = ref<Tab>('requests');
const pendingCount = ref(0);
const requestCount = ref(0);
const incoming = ref<UserFriendship[]>([]);
const outgoing = ref<UserFriendship[]>([]);

const requests = computed(() => {
	return activeTab.value === 'requests' ? incoming.value : outgoing.value;
});

const isAtEnd = computed(() => {
	return (
		(activeTab.value === 'requests' ? requestCount.value : pendingCount.value) ===
		requests.value.length
	);
});

watch(hasNewFriendRequests, () => {
	// When the request count changed from anywhere,
	// make sure we rebootstrap again when opening the popover the next time.
	isBootstrapped.value = false;
});

async function onShow() {
	if (isLoading.value) {
		return;
	}

	// Reset to empty.
	incoming.value = [];
	outgoing.value = [];

	isShowing.value = true;
	isLoading.value = true;

	// We only need to do this request once.
	if (!isBootstrapped.value) {
		const payload = await Api.sendRequest('/web/dash/friends/requests', null, {
			detach: true,
		});
		requestCount.value = payload.requestCount;
		grid.value?.pushViewNotifications('friend-requests', {}, true);
		pendingCount.value = payload.pendingCount;
		perPage.value = payload.perPage;

		isBootstrapped.value = true;
	}

	await _loadTab();

	isLoading.value = false;
}

async function _loadTab() {
	let url = '/web/dash/friends/requests/' + activeTab.value;
	const lastRequest =
		requests.value.length > 0 ? requests.value[requests.value.length - 1] : null;
	if (lastRequest) {
		url += '?from=' + lastRequest.created_on;
	}

	const payload = await Api.sendRequest(url, null, { detach: true });
	const newRequests = UserFriendship.populate(payload.requests) as UserFriendship[];

	requests.value.push(...newRequests);
}

function onHide() {
	isShowing.value = false;
}

async function setActiveTab(tab: Tab) {
	activeTab.value = tab;

	// Load tab the first time it's opened.
	if (requests.value.length === 0) {
		const count = activeTab.value === 'pending' ? pendingCount.value : requestCount.value;
		if (count > 0) {
			isLoading.value = true;
			await _loadTab();
			isLoading.value = false;
		}
	}
}

async function loadMore() {
	isLoading.value = true;
	await _loadTab();
	isLoading.value = false;
}

async function acceptRequest(request: UserFriendship) {
	await UserFriendshipHelper.acceptRequest(request);

	_removeRequest(request);
}

async function rejectRequest(request: UserFriendship) {
	if (!(await UserFriendshipHelper.rejectRequest(request))) {
		return;
	}

	_removeRequest(request);
}

async function cancelRequest(request: UserFriendship) {
	if (!(await UserFriendshipHelper.cancelRequest(request))) {
		return;
	}

	_removeRequest(request);
	pendingCount.value--;
}

function _removeRequest(request: UserFriendship) {
	const index = incoming.value.findIndex(item => item.id === request.id);
	if (index !== -1) {
		incoming.value.splice(index, 1);
	}

	// Set tab to outgoing when we just recalled the last pending request.
	// (We don't do this the other way cause we do show an empty incoming tab)
	if (activeTab.value === 'pending' && !outgoing.value.length) {
		setActiveTab('requests');
	}
}
</script>

<template>
	<AppPopper
		v-if="!Connection.isClientOffline"
		popover-class="fill-dark"
		fixed
		hide-on-state-change
		width="400px"
		@show="onShow()"
		@hide="onHide()"
	>
		<a
			v-app-tooltip.bottom="$gettext(`Friend Requests`)"
			v-app-track-event="`top-nav:friend-requests:toggle`"
			class="navbar-item"
			:class="{ active: isShowing }"
		>
			<div v-if="hasNewFriendRequests" class="-new-tag anim-fade-enter anim-fade-leave" />
			<AppJolticon icon="friend-requests" />
		</a>

		<template v-if="isShowing" #header>
			<div class="-header fill-darker">
				<nav class="-nav platform-list inline nav-justified">
					<ul>
						<li>
							<a
								:class="{ active: activeTab === 'requests' }"
								@click="setActiveTab('requests')"
							>
								<AppTranslate>Friend Requests</AppTranslate>
								<span class="badge">{{ requestCount }}</span>
							</a>
						</li>
						<li v-if="pendingCount">
							<a
								:class="{ active: activeTab === 'pending' }"
								@click="setActiveTab('pending')"
							>
								<AppTranslate>Sent Requests</AppTranslate>
								<span class="badge">{{ pendingCount }}</span>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		</template>

		<template v-if="isShowing" #popover>
			<div class="shell-card-popover">
				<div v-if="requests.length">
					<AppShellFriendRequestPopoverItem
						v-for="request of requests"
						:key="request.id"
						:request="request"
						@accept="acceptRequest(request)"
						@reject="rejectRequest(request)"
						@cancel="cancelRequest(request)"
					/>
				</div>
				<template v-if="isLoading">
					<br />
					<AppLoading centered />
				</template>
				<div v-else-if="!requests.length" class="alert">
					<AppTranslate>No friend requests right now.</AppTranslate>
				</div>
				<div v-else-if="!isAtEnd" class="page-cut -load-more">
					<AppButton v-app-track-event="`friend-requests:more`" trans @click="loadMore">
						<AppTranslate>Load More</AppTranslate>
					</AppButton>
				</div>
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
.-nav
	margin-bottom: 0
	padding-top: ($line-height-computed / 2)

.-load-more
	margin-top: 4px
	margin-bottom: 4px

.-new-tag
	border-radius: 50%
	width: 12px
	height: 12px
	display: block
	change-bg('highlight')
	position: absolute
	bottom: 10px
	right: 4px
	display: block
	border-color: var(--theme-darkest)
	border-width: 2px
	border-style: solid
</style>
