<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../_common/card/list/AppCardList.vue';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { UserBlock } from '../../../../../_common/user/block/block.model';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import FormUserBlock from '../../../../components/forms/user/block/block.vue';
import { useAccountRouteController } from '../account.vue';

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
})
export default class RouteDashAccountBlocks extends BaseRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	isBlocking = false;
	blocks: UserBlock[] = [];
	totalCount = 0;
	isLoadingMore = false;

	get routeTitle() {
		return this.routeStore.heading;
	}

	get shouldShowLoadMore() {
		return this.blocks.length < this.totalCount && !this.isLoadingMore;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Blocked Users`);
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
			showErrorGrowl(this.$gettext('Failed to unblock user. Try again in a bit.'));
			return;
		}

		showSuccessGrowl(
			this.$gettextInterpolate('Unblocked %{ name }!', {
				name: block.user.display_name,
			})
		);

		this.totalCount--;
		arrayRemove(this.blocks, i => i.id === block.id);
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-3 col-md-push-9 col-lg-4 col-lg-push-8">
			<div class="page-help">
				<translate>
					When you block someone, that user won't be able to follow you, send you a friend
					request, or reply to your posts and comments.
				</translate>
				<app-link-help page="blocking-users" class="link-help">
					<translate>Learn more about what happens when you block a user</translate>
				</app-link-help>
			</div>
		</div>
		<div class="col-md-9 col-md-pull-3 col-lg-8 col-lg-pull-4">
			<template v-if="!isRouteBootstrapped || isRouteLoading">
				<app-loading centered />
			</template>
			<template v-else>
				<template v-if="totalCount === 0">
					<p class="lead text-center">
						<translate>You aren't blocking anyone.</translate>
					</p>
					<br />
				</template>

				<app-card-list :is-adding="isBlocking">
					<app-card-list-add
						:label="$gettext('Block User')"
						@toggle="isBlocking = !isBlocking"
					>
						<form-user-block @submit="onBlockSubmit" />
					</app-card-list-add>
				</app-card-list>

				<template v-if="totalCount !== 0">
					<div v-for="block of blocks" :key="block.id" class="-item">
						<app-user-avatar class="-item-avatar" :user="block.user" />

						<div class="-item-label">
							<div class="-item-name">
								{{ block.user.display_name }}
								<app-user-verified-tick :user="block.user" />
							</div>

							<div class="-item-username">@{{ block.user.username }}</div>

							<small>
								<translate>Blocked:</translate>
								<app-time-ago :date="block.blocked_on" />
							</small>
						</div>

						<app-button class="-item-controls" @click="onClickUnblock(block)">
							<translate>Unblock</translate>
						</app-button>
					</div>

					<div v-if="shouldShowLoadMore" class="page-cut">
						<app-button
							v-app-track-event="`profile-edit-blocks:more`"
							trans
							@click="loadMore()"
						>
							<translate>Load More</translate>
						</app-button>
					</div>
					<app-loading v-else-if="isLoadingMore" centered />
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
