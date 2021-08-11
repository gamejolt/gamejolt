import { Component, Inject } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { CommunityActivityItem } from '../../../../../../_common/community/activity-item/activity-item.model';
import AppCommunityActivityItem from '../../../../../../_common/community/activity-item/activity-item.vue';
import { date } from '../../../../../../_common/filters/date';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';

type ActivityItem = {
	item: CommunityActivityItem;
	timesplit: boolean;
	usersplit: boolean;
	showIcon: boolean;
};

@Component({
	name: 'RouteCommunitiesViewEditActivity',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityActivityItem,
		AppLoading,
	},
	filters: {
		date,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/activity/' + route.params.id);
	},
})
export default class RouteCommunitiesViewEditActivity extends BaseRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	items: ActivityItem[] = [];
	isAtEnd = false;
	isLoading = false;

	routeResolved($payload: any) {
		this.handlePayload($payload);
	}

	async loadMore() {
		this.isLoading = true;
		const payload = await Api.sendRequest(
			'/web/dash/communities/activity/' +
				this.routeStore.community.id +
				'?from=' +
				this.items[this.items.length - 1].item.added_on,
			undefined,
			{
				detach: true,
			}
		);
		this.isLoading = false;

		this.handlePayload(payload);
	}

	private handlePayload(payload: any) {
		const items = CommunityActivityItem.populate(payload.items) as CommunityActivityItem[];
		const perPage = payload.perPage;

		if (items.length > 0) {
			this.addItems(items);
		}

		if (items.length < perPage) {
			this.isAtEnd = true;
		}
	}

	private addItems(items: CommunityActivityItem[]) {
		for (const item of items) {
			const newItem = {
				item,
				timesplit: false,
				usersplit: false,
				showIcon: true,
			} as ActivityItem;

			if (
				this.items.length === 0 ||
				item.type === CommunityActivityItem.TYPE_COMMUNITY_CREATED
			) {
				// The first item will always be a user/time split.
				newItem.timesplit = true;
				newItem.usersplit = true;
			} else {
				// Compare to the last item in the list.
				// When it's a different day, have a full split (user and time).
				const lastItem = this.items[this.items.length - 1].item;
				if (date(lastItem.added_on, 'mediumDate') !== date(item.added_on, 'mediumDate')) {
					newItem.timesplit = true;
					newItem.usersplit = true;
				} else {
					// When the difference in time is more than 30 minutes, have a user split.
					if (Math.abs(lastItem.added_on - item.added_on) > 1000 * 30 * 60) {
						newItem.usersplit = true;
					}

					// We may not have a user attached to the item at all.
					// If we have a difference between having a user and not having a user, split.
					// We group all items by "not a user" together.
					const newItemUser = !!item.user;
					const lastItemUser = !!lastItem.user;
					if (newItemUser !== lastItemUser) {
						newItem.usersplit = true;
					}

					// Have a user split when it's a different user from the last item.
					if (item.user && lastItem.user && lastItem.user.id !== item.user.id) {
						newItem.usersplit = true;
					}
				}

				// Don't show the icon twice in a row if it's the same.
				if (!newItem.usersplit && !newItem.timesplit) {
					const lastItemTypeIcon = lastItem.getTypeIcon();
					const newItemTypeIcon = item.getTypeIcon();
					if (
						lastItemTypeIcon?.color === newItemTypeIcon?.color &&
						lastItemTypeIcon?.icon === newItemTypeIcon?.icon
					) {
						newItem.showIcon = false;
					}
				}
			}

			this.items.push(newItem);
		}
	}
}
