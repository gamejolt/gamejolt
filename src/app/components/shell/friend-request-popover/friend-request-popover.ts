import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import AppPopperTS from 'game-jolt-frontend-lib/components/popper/popper';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { UserFriendship } from 'game-jolt-frontend-lib/components/user/friendship/friendship.model';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation, State } from 'vuex-class/lib/bindings';
import { Store } from '../../../store';
import { UserFriendshipHelper } from '../../user/friendships-helper/friendship-helper.service';
import AppShellFriendRequestPopoverItem from './item/item.vue';

type Tab = 'requests' | 'pending';

@Component({
	components: {
		AppPopper,
		AppLoading,
		AppShellFriendRequestPopoverItem,
	},
	directives: {
		AppTooltip,
		AppTrackEvent,
	},
})
export default class AppShellFriendRequestPopover extends Vue {
	@State
	friendRequestCount!: Store['friendRequestCount'];

	@Mutation
	setFriendRequestCount!: Store['setFriendRequestCount'];

	@AppState
	user!: AppStore['user'];

	isShowing = false;
	isLoading = false;

	activeTab: Tab = 'requests';
	incoming: UserFriendship[] = [];
	outgoing: UserFriendship[] = [];

	$refs!: {
		popper: AppPopperTS;
	};

	readonly Connection = Connection;

	get requests() {
		return this.activeTab === 'requests' ? this.incoming : this.outgoing;
	}

	/**
	 * When our list changes, make sure to recheck items in view since things shifted.
	 */
	@Watch('requests')
	onRequestsChange() {
		if (this.$refs.popper && this.$refs.popper.$refs.scroller) {
			this.$refs.popper.$refs.scroller.queueInviewCheck();
		}
	}

	async onShow() {
		if (this.isLoading) {
			return;
		}

		this.isShowing = true;
		this.isLoading = true;

		const { requests, pending } = await UserFriendship.fetchRequests();
		this.incoming = requests;
		this.setFriendRequestCount(this.incoming.length);
		this.outgoing = pending;
		this.isLoading = false;
	}

	onHide() {
		this.isShowing = false;
	}

	setActiveTab(tab: Tab) {
		this.activeTab = tab;
	}

	async acceptRequest(request: UserFriendship) {
		await UserFriendshipHelper.acceptRequest(request);
		this.removeRequest(request);
	}

	async rejectRequest(request: UserFriendship) {
		if (!(await UserFriendshipHelper.rejectRequest(request))) {
			return;
		}
		this.removeRequest(request);
	}

	async cancelRequest(request: UserFriendship) {
		if (!(await UserFriendshipHelper.cancelRequest(request))) {
			return;
		}
		this.removeRequest(request);
	}

	private removeRequest(request: UserFriendship) {
		const index = this.incoming.findIndex(item => item.id === request.id);
		if (index !== -1) {
			this.incoming.splice(index, 1);
		}

		this.setFriendRequestCount(this.incoming.length);

		if (this.activeTab === 'pending' && !this.outgoing.length) {
			this.setActiveTab('requests');
		}
	}
}
