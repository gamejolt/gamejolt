import { Options, Vue, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class/lib/bindings';
import { Api } from '../../../../_common/api/api.service';
import { Connection } from '../../../../_common/connection/connection-service';
import AppLoading from '../../../../_common/loading/loading.vue';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserFriendship } from '../../../../_common/user/friendship/friendship.model';
import { Store } from '../../../store';
import { UserFriendshipHelper } from '../../user/friendships-helper/friendship-helper.service';
import AppShellFriendRequestPopoverItem from './item/item.vue';

type Tab = 'requests' | 'pending';

@Options({
	components: {
		AppPopper,
		AppLoading,
		AppShellFriendRequestPopoverItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellFriendRequestPopover extends Vue {
	@State
	hasNewFriendRequests!: Store['hasNewFriendRequests'];

	@AppState
	user!: AppStore['user'];

	@State
	grid!: Store['grid'];

	isShowing = false;
	isLoading = false;
	perPage = 50;
	isBootstrapped = false;

	activeTab: Tab = 'requests';
	pendingCount = 0;
	requestCount = 0;
	incoming: UserFriendship[] = [];
	outgoing: UserFriendship[] = [];

	readonly Connection = Connection;

	get requests() {
		return this.activeTab === 'requests' ? this.incoming : this.outgoing;
	}

	get isAtEnd() {
		return (
			(this.activeTab === 'requests' ? this.requestCount : this.pendingCount) ===
			this.requests.length
		);
	}

	async onShow() {
		if (this.isLoading) {
			return;
		}

		// Reset to empty.
		this.incoming = [];
		this.outgoing = [];

		this.isShowing = true;
		this.isLoading = true;

		// We only need to do this request once.
		if (!this.isBootstrapped) {
			const payload = await Api.sendRequest('/web/dash/friends/requests', null, {
				detach: true,
			});
			this.requestCount = payload.requestCount;
			this.grid?.pushViewNotifications('friend-requests', {}, true);
			this.pendingCount = payload.pendingCount;
			this.perPage = payload.perPage;

			this.isBootstrapped = true;
		}

		await this.loadTab();

		this.isLoading = false;
	}

	private async loadTab() {
		let url = '/web/dash/friends/requests/' + this.activeTab;
		const lastRequest =
			this.requests.length > 0 ? this.requests[this.requests.length - 1] : null;
		if (lastRequest) {
			url += '?from=' + lastRequest.created_on;
		}

		const payload = await Api.sendRequest(url, null, { detach: true });
		const requests = UserFriendship.populate(payload.requests) as UserFriendship[];

		this.requests.push(...requests);
	}

	@Watch('hasNewFriendRequests')
	onhasNewFriendRequestsChanged() {
		// When the request count changed from anywhere,
		// make sure we rebootstrap again when opening the popover the next time.
		this.isBootstrapped = false;
	}

	onHide() {
		this.isShowing = false;
	}

	async setActiveTab(tab: Tab) {
		this.activeTab = tab;

		// Load tab the first time it's opened.
		if (this.requests.length === 0) {
			const count = this.activeTab === 'pending' ? this.pendingCount : this.requestCount;
			if (count > 0) {
				this.isLoading = true;
				await this.loadTab();
				this.isLoading = false;
			}
		}
	}

	async loadMore() {
		this.isLoading = true;
		await this.loadTab();
		this.isLoading = false;
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
		this.pendingCount--;
	}

	private removeRequest(request: UserFriendship) {
		const index = this.incoming.findIndex(item => item.id === request.id);
		if (index !== -1) {
			this.incoming.splice(index, 1);
		}

		// Set tab to outgoing when we just recalled the last pending request.
		// (We don't do this the other way cause we do show an empty incoming tab)
		if (this.activeTab === 'pending' && !this.outgoing.length) {
			this.setActiveTab('requests');
		}
	}
}
