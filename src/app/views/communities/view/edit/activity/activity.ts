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

	perPage = 50;
	itemsPerDay: Map<string, CommunityActivityItem[]> = new Map<string, CommunityActivityItem[]>();

	items: ActivityItem[] = [];

	routeResolved($payload: any) {
		this.perPage = $payload.perPage;
		const items = CommunityActivityItem.populate($payload.items) as CommunityActivityItem[];

		this.addItems(items);
	}

	private addItems(items: CommunityActivityItem[]) {
		for (const item of items) {
			const newItem = { item, timesplit: false, usersplit: false } as ActivityItem;

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
			}

			this.items.push(newItem);
		}
	}
}
