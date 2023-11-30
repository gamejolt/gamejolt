<script lang="ts">
import { ref, toRef } from 'vue';
import { vAppTrackEvent } from '../../../../../_common/analytics/track-event.directive';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppCardList from '../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../_common/card/list/AppCardListAdd.vue';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppLinkHelp from '../../../../../_common/link/AppLinkHelp.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { showModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserVerifiedTick from '../../../../../_common/user/AppUserVerifiedTick.vue';
import { UserBlockModel } from '../../../../../_common/user/block/block.model';
import AppUserAvatar from '../../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { arrayRemove } from '../../../../../utils/array';
import FormUserBlock from '../../../../components/forms/user/block/block.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		lazy: false,
		resolver: () => Api.sendRequest('/web/dash/blocks'),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const isBlocking = ref(false);
const blocks = ref<UserBlockModel[]>([]);
const totalCount = ref(0);
const isLoadingMore = ref(false);

const shouldShowLoadMore = toRef(
	() => blocks.value.length < totalCount.value && !isLoadingMore.value
);

async function loadMore() {
	isLoadingMore.value = true;

	const from = blocks.value.length > 0 ? blocks.value[blocks.value.length - 1].blocked_on : '';
	const payload = await Api.sendRequest('/web/dash/blocks/more?from=' + from);
	if (payload.blocks) {
		const newBlocks = UserBlockModel.populate(payload.blocks);
		blocks.value.push(...newBlocks);
	}

	isLoadingMore.value = false;
}

function onBlockSubmit() {
	isBlocking.value = false;
	blocks.value = [];
	totalCount.value++;
	loadMore();
}

async function onClickUnblock(block: UserBlockModel) {
	const confirm = await showModalConfirm(
		$gettext(`Are you sure you want to unblock %{ name }?`, {
			name: block.user.display_name,
		}),
		$gettext(`Unblock user`)
	);
	if (!confirm) {
		return;
	}

	const payload = await Api.sendRequest(`/web/dash/blocks/remove/${block.id}`, {});
	if (!payload.success) {
		showErrorGrowl($gettext('Failed to unblock user. Try again in a bit.'));
		return;
	}

	showSuccessGrowl(
		$gettext('Unblocked %{ name }!', {
			name: block.user.display_name,
		})
	);

	totalCount.value--;
	arrayRemove(blocks.value, i => i.id === block.id);
}

const { isBootstrapped, isLoading } = createAppRoute({
	routeTitle: heading,
	onInit() {
		heading.value = $gettext(`Blocked Users`);
	},
	onResolved({ payload }) {
		blocks.value = UserBlockModel.populate(payload.blocks);
		totalCount.value = payload.total || 0;
	},
});
</script>

<template>
	<div class="row">
		<div class="col-md-3 col-md-push-9 col-lg-4 col-lg-push-8">
			<div class="page-help">
				{{
					$gettext(
						`When you block someone, that user won't be able to follow you, send you a friend request, or reply to your posts and comments.`
					)
				}}
				{{ ' ' }}
				<AppLinkHelp page="blocking-users" class="link-help">
					{{ $gettext(`Learn more about what happens when you block a user`) }}
				</AppLinkHelp>
			</div>
		</div>
		<div class="col-md-9 col-md-pull-3 col-lg-8 col-lg-pull-4">
			<template v-if="!isBootstrapped || isLoading">
				<AppLoading centered />
			</template>
			<template v-else>
				<template v-if="totalCount === 0">
					<p class="lead text-center">
						{{ $gettext(`You aren't blocking anyone.`) }}
					</p>
					<br />
				</template>

				<AppCardList :is-adding="isBlocking">
					<AppCardListAdd
						:label="$gettext('Block User')"
						@toggle="isBlocking = !isBlocking"
					>
						<FormUserBlock @submit="onBlockSubmit" />
					</AppCardListAdd>
				</AppCardList>

				<template v-if="totalCount !== 0">
					<div v-for="block of blocks" :key="block.id" class="-item">
						<AppUserAvatar class="-item-avatar" :user="block.user" />

						<div class="-item-label">
							<div class="-item-name">
								{{ block.user.display_name }}
								<AppUserVerifiedTick :user="block.user" />
							</div>

							<div class="-item-username">@{{ block.user.username }}</div>

							<small>
								{{ $gettext(`Blocked:`) }}
								{{ ' ' }}
								<AppTimeAgo :date="block.blocked_on" />
							</small>
						</div>

						<AppButton class="-item-controls" @click="onClickUnblock(block)">
							{{ $gettext(`Unblock`) }}
						</AppButton>
					</div>

					<div v-if="shouldShowLoadMore" class="page-cut">
						<AppButton
							v-app-track-event="`profile-edit-blocks:more`"
							trans
							@click="loadMore()"
						>
							{{ $gettext(`Load More`) }}
						</AppButton>
					</div>
					<AppLoading v-else-if="isLoadingMore" centered />
				</template>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-height = 50px
$-avatar-height = 40px
$-v-padding = 16px
$-h-padding = 20px

.-item
	display: flex
	align-items: center
	padding: $-v-padding 0
	overflow: hidden
	border-bottom: $border-width-small solid var(--theme-bg-subtle)

	&:last-child
		border-bottom: 0

	&-avatar
		flex: none
		width: $-avatar-height
		margin-right: $-h-padding

	&-controls
		flex: none
		margin-left: $-h-padding

	&-label
		flex: auto
		overflow: hidden

	&-name
	&-username
		text-overflow()

	&-name
		font-weight: bold

	&-username
		color: var(--theme-fg-muted)
		font-size: $font-size-small
</style>
