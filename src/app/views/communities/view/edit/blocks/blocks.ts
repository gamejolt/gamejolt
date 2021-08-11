import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../../_common/card/list/list.vue';
import { Growls } from '../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import AppPagination from '../../../../../../_common/pagination/pagination.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { AppTimeAgo } from '../../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { UserBlock } from '../../../../../../_common/user/block/block.model';
import AppUserCardHover from '../../../../../../_common/user/card/hover/hover.vue';
import AppUserAvatarImg from '../../../../../../_common/user/user-avatar/img/img.vue';
import FormCommunityBlock from '../../../../../components/forms/community/ban/block.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

@Options({
	name: 'RouteCommunitiesViewEditBlocks',
	components: {
		AppCommunitiesViewPageContainer,
		FormCommunityBlock,
		AppCardListAdd,
		AppCardList,
		AppUserAvatarImg,
		AppTimeAgo,
		AppUserCardHover,
		AppPagination,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/blocks/' + route.params.id);
	},
})
export default class RouteCommunitiesViewEditBlocks extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	isAdding = false;
	blocks: UserBlock[] = [];
	totalCount = 0;
	perPage = 0;

	page = 1;
	// Default to showing new blocks first
	sort = 'blocked-on';
	sortDirection = 'desc';

	get community() {
		return this.routeStore.community;
	}

	get sortIcon() {
		if (this.sortDirection === 'asc') {
			return 'chevron-up';
		} else {
			return 'chevron-down';
		}
	}

	get sortDirectionLabel() {
		if (this.sortDirection === 'asc') {
			return this.$gettext('Ascending');
		} else {
			return this.$gettext('Descending');
		}
	}

	get hasBlocks() {
		return this.blocks.length > 0;
	}

	routeResolved($payload: any) {
		this.blocks = UserBlock.populate($payload.blocks);
		this.totalCount = $payload.totalCount;
		this.perPage = $payload.perPage;

		if (this.blocks.length === 0) {
			this.isAdding = true;
		}
	}

	onBlockSubmit() {
		this.isAdding = false;
		this.page = 1;
		this.refetch();
	}

	async refetch() {
		const url = `/web/dash/communities/blocks/${this.community.id}?page=${this.page}&sort=${this.sort}&sort-direction=${this.sortDirection}`;
		const payload = await Api.sendRequest(url);
		this.blocks = UserBlock.populate(payload.blocks);
	}

	changeSort(sort: string) {
		if (this.sort === sort) {
			this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			this.sort = sort;
			this.sortDirection = 'asc';
		}

		this.page = 1;
		this.refetch();
	}

	async onClickLift(block: UserBlock) {
		const response = await ModalConfirm.show(
			this.$gettextInterpolate(
				'Do you really want to lift the block for the user @%{ username } early? The reason they were blocked: %{ reason }',
				{ username: block.user.username, reason: block.reason }
			),
			this.$gettext('Lift Block')
		);

		if (response) {
			let success = false;
			try {
				const payload = await Api.sendRequest(
					`/web/dash/communities/blocks/remove/${block.id}`,
					{},
					{
						detach: true,
					}
				);

				success = payload && payload.success;
			} catch (e) {
				console.error(e);
				success = false;
			}

			if (success) {
				this.refetch();
			} else {
				Growls.error(this.$gettext('Failed to lift block.'));
			}
		}
	}

	onPageChanged(page: number) {
		this.page = page;
		this.refetch();
	}
}
