import View from '!view!./request-popover.html';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Mutation } from 'vuex-class/lib/bindings';
import { AppScrollInviewParent } from '../../../../lib/gj-lib-client/components/scroll/inview/parent';
import { UserFriendship } from '../../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { findRequiredVueParent } from '../../../../lib/gj-lib-client/utils/vue';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Store } from '../../../store/index';
import { UserFriendshipHelper } from '../../user/friendships-helper/friendship-helper.service';
import { AppFriendRequestPopoverItem } from './item/item';

type Tab = 'requests' | 'pending';

@View
@Component({
	components: {
		AppLoading,
		AppFriendRequestPopoverItem,
	},
})
export class AppFriendRequestPopover extends Vue {
	@Mutation
	setFriendRequestCount!: Store['setFriendRequestCount'];
	@AppState
	user!: AppStore['user'];

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
			this.inviewParent.queueCheck();
		}
	}

	mounted() {
		this.fetchRequests();
		this.inviewParent = findRequiredVueParent(this, AppScrollInviewParent);
	}

	async fetchRequests() {
		const { requests, pending } = await UserFriendship.fetchRequests();
		this.incoming = requests;
		this.setFriendRequestCount(this.incoming.length);
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
