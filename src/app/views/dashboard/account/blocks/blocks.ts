import { Options } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../_common/card/list/list.vue';
import { Growls } from '../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { Translate } from '../../../../../_common/translate/translate.service';
import { UserBlock } from '../../../../../_common/user/block/block.model';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import FormUserBlock from '../../../../components/forms/user/block/block.vue';
import { routeStore, RouteStore, RouteStoreModule } from '../account.store';

@Options({
	name: 'RouteDashAccountBlocks',
	components: {
		FormUserBlock,
		AppLoading,
		AppCardList,
		AppCardListAdd,
		AppUserAvatar,
		AppTimeAgo,
		AppUserVerifiedTick,
	},
	directives: {},
})
@RouteResolver({
	deps: {},
	lazy: false,
	resolver: () => Api.sendRequest('/web/dash/blocks'),
	resolveStore({}) {
		routeStore.commit('setHeading', Translate.$gettext(`Blocked Users`));
	},
})
export default class RouteDashAccountBlocks extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	isBlocking = false;
	blocks: UserBlock[] = [];
	totalCount = 0;
	isLoadingMore = false;

	get routeTitle() {
		return this.heading;
	}

	get shouldShowLoadMore() {
		return this.blocks.length < this.totalCount && !this.isLoadingMore;
	}

	routeResolved($payload: any) {
		this.blocks = UserBlock.populate($payload.blocks);
		this.totalCount = $payload.total || 0;
	}

	async loadMore() {
		this.isLoadingMore = true;

		const from = this.blocks.length > 0 ? this.blocks[this.blocks.length - 1].blocked_on : '';
		const payload = await Api.sendRequest('/web/dash/blocks/more?from=' + from);
		if (payload.blocks) {
			const blocks = UserBlock.populate(payload.blocks);
			this.blocks.push(...blocks);
		}

		this.isLoadingMore = false;
	}

	onBlockSubmit() {
		this.isBlocking = false;
		this.blocks = [];
		this.totalCount++;
		this.loadMore();
	}

	async onClickUnblock(block: UserBlock) {
		const confirm = await ModalConfirm.show(
			this.$gettextInterpolate(`Are you sure you want to unblock %{ name }?`, {
				name: block.user.display_name,
			}),
			this.$gettext(`Unblock user`)
		);
		if (!confirm) {
			return;
		}

		const payload = await Api.sendRequest(`/web/dash/blocks/remove/${block.id}`, {});
		if (!payload.success) {
			Growls.error(this.$gettext('Failed to unblock user. Try again in a bit.'));
			return;
		}

		Growls.success(
			this.$gettextInterpolate('Unblocked %{ name }!', {
				name: block.user.display_name,
			})
		);

		this.totalCount--;
		arrayRemove(this.blocks, i => i.id === block.id);
	}
}
