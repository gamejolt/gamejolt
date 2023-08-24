<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { CommunityActivityItemModel } from '../../../../../../_common/community/activity-item/activity-item.model';
import AppCommunityActivityItem from '../../../../../../_common/community/activity-item/activity-item.vue';
import { formatDate } from '../../../../../../_common/filters/date';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../view.store';

type ActivityItem = {
	item: CommunityActivityItemModel;
	timesplit: boolean;
	usersplit: boolean;
	showIcon: boolean;
};

@Options({
	name: 'RouteCommunitiesViewEditActivity',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunityActivityItem,
		AppLoading,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['id'] },
	resolver({ route }) {
		return Api.sendRequest('/web/dash/communities/activity/' + route.params.id);
	},
})
export default class RouteCommunitiesViewEditActivity extends LegacyRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	items: ActivityItem[] = [];
	isAtEnd = false;
	isLoading = false;

	readonly formatDate = formatDate;

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
		const items = CommunityActivityItemModel.populate(
			payload.items
		) as CommunityActivityItemModel[];
		const perPage = payload.perPage;

		if (items.length > 0) {
			this.addItems(items);
		}

		if (items.length < perPage) {
			this.isAtEnd = true;
		}
	}

	private addItems(items: CommunityActivityItemModel[]) {
		for (const item of items) {
			const newItem = {
				item,
				timesplit: false,
				usersplit: false,
				showIcon: true,
			} as ActivityItem;

			if (
				this.items.length === 0 ||
				item.type === CommunityActivityItemModel.TYPE_COMMUNITY_CREATED
			) {
				// The first item will always be a user/time split.
				newItem.timesplit = true;
				newItem.usersplit = true;
			} else {
				// Compare to the last item in the list.
				// When it's a different day, have a full split (user and time).
				const lastItem = this.items[this.items.length - 1].item;
				if (
					formatDate(lastItem.added_on, 'mediumDate') !==
					formatDate(item.added_on, 'mediumDate')
				) {
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
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<h2 class="section-header">
			<AppTranslate>Audit Log</AppTranslate>
		</h2>

		<div class="page-help">
			<p>
				<AppTranslate>
					Chronological list of moderation activity in this community.
				</AppTranslate>
			</p>
		</div>

		<div>
			<div v-for="item of items" :key="item.item.id">
				<div v-if="item.timesplit" class="-date-split">
					<span class="-inner">{{ formatDate(item.item.added_on, 'mediumDate') }}</span>
				</div>

				<AppCommunityActivityItem
					:item="item.item"
					:usersplit="item.usersplit"
					:show-icon="item.showIcon"
				/>
			</div>
		</div>

		<template v-if="isLoading">
			<AppLoading centered />
		</template>
		<div v-else-if="!isAtEnd" class="page-cut -more">
			<AppButton v-app-track-event="`community-edit-activity:more`" trans @click="loadMore">
				<AppTranslate>Load More</AppTranslate>
			</AppButton>
		</div>
	</AppCommunitiesViewPageContainer>
</template>

<style lang="stylus" scoped>
.-date-split
	position: relative
	display: block
	margin-top: $line-height-computed * 0.5
	margin-bottom: $line-height-computed * 0.5
	width: 100%
	text-align: center
	cursor: default

	&::before
		border-bottom-color: var(--theme-bg-offset)
		content: ''
		position: absolute
		left: 0
		right: 0
		top: 50%
		margin-top: 0
		height: 0
		border-bottom-width: $border-width-large
		border-bottom-style: solid
		z-index: 0

	& > .-inner
		change-bg('bg-offset')
		color: var(--theme-fg-muted)
		position: relative
		padding-left: 8px
		padding-right: 8px
		font-weight: bold
		font-size: $font-size-small
		z-index: 1
		rounded-corners()

.-more
	margin-top: 12px
</style>
