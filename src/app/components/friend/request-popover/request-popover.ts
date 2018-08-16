import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./request-popover.html';

import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { UserFriendship } from '../../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { UserFriendshipHelper } from '../../user/friendships-helper/friendship-helper.service';
import { Store } from '../../../store/index';
import { Mutation } from 'vuex-class/lib/bindings';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppFriendRequestPopoverItem } from './item/item';
import { AppScrollInviewParent } from '../../../../lib/gj-lib-client/components/scroll/inview/parent';

type Tab = 'requests' | 'pending';

@View
@Component({
	components: {
		AppPopover,
		AppLoading,
		AppFriendRequestPopoverItem,
	},
})
export class AppFriendRequestPopover extends Vue {
	@Mutation setFriendRequestCount!: Store['setFriendRequestCount'];
	@AppState user!: AppStore['user'];

	isShown = false;
	isLoading = true;

	activeTab: Tab = 'requests';
	incoming: UserFriendship[] = [];
	outgoing: UserFriendship[] = [];

	// Don't set default value so it doesn't watch.
	private inviewParent?: AppScrollInviewParent;

	get requests() {
		return this.activeTab === 'requests' ? this.incoming : this.outgoing;
	}

	/**
	 * When our list changes, make sure to recheck items in view since things shifted.
	 */
	@Watch('requests')
	onRequestsChange() {
		if (this.inviewParent) {
			this.inviewParent.container.queueCheck();
		}
	}

	onFocus() {
		this.isShown = true;
		this.fetchRequests();
		this.$emit('focused');
	}

	onBlur() {
		this.isShown = false;
		this.$emit('blurred');
	}

	private setCount(count: number) {
		this.setFriendRequestCount(count);
	}

	async fetchCount() {
		const response = await UserFriendship.fetchCount();
		this.setCount(response.requestCount);
	}

	async fetchRequests() {
		const { requests, pending } = await UserFriendship.fetchRequests();
		this.incoming = requests;
		this.setCount(this.incoming.length);
		this.outgoing = pending;
		this.isLoading = false;
	}

	setActiveTab(tab: Tab) {
		this.activeTab = tab;
	}

	async acceptRequest(request: UserFriendship) {
		await UserFriendshipHelper.acceptRequest(request);
		this.removeRequest(request);
	}

	async rejectRequest(request: UserFriendship) {
		if (!await UserFriendshipHelper.rejectRequest(request)) {
			return;
		}
		this.removeRequest(request);
	}

	async cancelRequest(request: UserFriendship) {
		if (!await UserFriendshipHelper.cancelRequest(request)) {
			return;
		}
		this.removeRequest(request);
	}

	private removeRequest(request: UserFriendship) {
		const index = this.incoming.findIndex(item => item.id === request.id);
		if (index !== -1) {
			this.incoming.splice(index, 1);
		}

		this.setCount(this.incoming.length);

		if (this.activeTab === 'pending' && !this.outgoing.length) {
			this.setActiveTab('requests');
		}
	}
}
