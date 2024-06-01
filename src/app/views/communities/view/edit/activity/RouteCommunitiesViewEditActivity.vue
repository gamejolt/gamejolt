<script lang="ts">
import { ref } from 'vue';
import { vAppTrackEvent } from '../../../../../../_common/analytics/track-event.directive';
import { Api } from '../../../../../../_common/api/api.service';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppCommunityActivityItem from '../../../../../../_common/community/activity-item/AppCommunityActivityItem.vue';
import {
	CommunityActivityItemModel,
	CommunityActivityItemType,
} from '../../../../../../_common/community/activity-item/activity-item.model';
import { formatDate } from '../../../../../../_common/filters/date';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppCommunitiesViewPageContainer from '../../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../../view.store';

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['id'] },
		resolver({ route }) {
			return Api.sendRequest('/web/dash/communities/activity/' + route.params.id);
		},
	}),
};

type ActivityItem = {
	item: CommunityActivityItemModel;
	timesplit: boolean;
	usersplit: boolean;
	showIcon: boolean;
};
</script>

<script lang="ts" setup>
const routeStore = useCommunityRouteStore()!;

const items = ref<ActivityItem[]>([]);
const isAtEnd = ref(false);
const isLoading = ref(false);

async function loadMore() {
	isLoading.value = true;
	const payload = await Api.sendRequest(
		'/web/dash/communities/activity/' +
			routeStore.community.id +
			'?from=' +
			items.value[items.value.length - 1].item.added_on,
		undefined,
		{
			detach: true,
		}
	);
	isLoading.value = false;

	handlePayload(payload);
}

function handlePayload(payload: any) {
	const newItems = CommunityActivityItemModel.populate(
		payload.items
	) as CommunityActivityItemModel[];
	const perPage = payload.perPage;

	if (newItems.length > 0) {
		addItems(newItems);
	}

	if (newItems.length < perPage) {
		isAtEnd.value = true;
	}
}

function addItems(newItems: CommunityActivityItemModel[]) {
	for (const item of newItems) {
		const newItem = {
			item,
			timesplit: false,
			usersplit: false,
			showIcon: true,
		} as ActivityItem;

		if (items.value.length === 0 || item.type === CommunityActivityItemType.CommunityCreated) {
			// The first item will always be a user/time split.
			newItem.timesplit = true;
			newItem.usersplit = true;
		} else {
			// Compare to the last item in the list.
			// When it's a different day, have a full split (user and time).
			const lastItem = items.value[items.value.length - 1].item;
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

		items.value.push(newItem);
	}
}

createAppRoute({
	onResolved({ payload }) {
		handlePayload(payload);
	},
});
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<h2 class="section-header">
			{{ $gettext(`Audit Log`) }}
		</h2>

		<div class="page-help">
			<p>
				{{ $gettext(`Chronological list of moderation activity in this community.`) }}
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
				{{ $gettext(`Load More`) }}
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
