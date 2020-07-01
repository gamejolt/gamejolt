import { Component, Inject } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { CommunityActivityItem } from '../../../../../../_common/community/activity-item/activity-item.model';
import AppCommunityActivityItem from '../../../../../../_common/community/activity-item/activity-item.vue';
import { date } from '../../../../../../_common/filters/date';
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
	},
	filters: {
		date,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/activity/' + route.params.id, {});
	},
})
export default class RouteCommunitiesViewEditActivity extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	items: ActivityItem[] = [];
	isAtEnd = false;

	routeResolved($payload: any) {
		this.handlePayload($payload);
	}

	async loadMore() {
		const payload = await Api.sendRequest(
			'/web/dash/communities/activity/' + this.routeStore.community.id,
			{
				from: this.items[this.items.length - 1].item.added_on,
			},
			{
				detach: true,
			}
		);

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
				// When the difference in time is more than 20 minutes or it's a different user, have a user split.
				const lastItem = this.items[this.items.length - 1].item;
				if (date(lastItem.added_on, 'mediumDate') !== date(item.added_on, 'mediumDate')) {
					newItem.timesplit = true;
					newItem.usersplit = true;
				} else if (
					Math.abs(lastItem.added_on - item.added_on) > 1000 * 30 * 60 ||
					lastItem.user.id !== item.user.id
				) {
					newItem.usersplit = true;
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
