<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../_common/card/list/AppCardListAdd.vue';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import AppPagination from '../../../../../../_common/pagination/pagination.vue';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../_common/route/route-component';
import { AppTimeAgo } from '../../../../../../_common/time/ago/ago';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { UserBlock } from '../../../../../../_common/user/block/block.model';
import AppUserCardHover from '../../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatarImg from '../../../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
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
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute({
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
				showErrorGrowl(this.$gettext('Failed to lift block.'));
			}
		}
	}

	onPageChanged(page: number) {
		this.page = page;
		this.refetch();
	}
}
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<h2 class="section-header">
			<AppTranslate>Blocked Users</AppTranslate>
		</h2>

		<div class="page-help">
			<p>
				<AppTranslate>
					Block users from contributing to this community. They will not be able to join
					or post.
				</AppTranslate>
			</p>
		</div>

		<AppCardList :is-adding="isAdding">
			<AppCardListAdd :label="$gettext('Block User')" @toggle="isAdding = !isAdding">
				<FormCommunityBlock :community="community" @submit="onBlockSubmit" />
			</AppCardListAdd>
		</AppCardList>
		<div class="table-responsive">
			<table v-if="hasBlocks" class="table">
				<thead>
					<tr>
						<th class="-header" @click="changeSort('name')">
							<AppTranslate>Blocked user</AppTranslate>
							<span v-if="sort === 'name'">
								<AppJolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('blocker')">
							<AppTranslate>Issued by</AppTranslate>
							<span v-if="sort === 'blocker'">
								<AppJolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('blocked-on')">
							<AppTranslate>Blocked on</AppTranslate>
							<span v-if="sort === 'blocked-on'">
								<AppJolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th class="-header" @click="changeSort('expires-on')">
							<AppTranslate>Expires</AppTranslate>
							<span v-if="sort === 'expires-on'">
								<AppJolticon v-app-tooltip="sortDirectionLabel" :icon="sortIcon" />
							</span>
						</th>
						<th />
					</tr>
				</thead>
				<tbody>
					<tr v-for="block of blocks" :key="block.user.id" class="-row">
						<td>
							<router-link
								:to="{
									name: 'profile.overview',
									params: { username: block.user.username },
								}"
								class="-user-link"
							>
								<AppUserCardHover :user="block.user">
									<span class="-user-link">
										<AppUserAvatarImg class="-avatar" :user="block.user" />
										<span class="-user-link-name">
											@{{ block.user.username }}
										</span>
									</span>
								</AppUserCardHover>
							</router-link>
						</td>

						<td>
							<router-link
								v-if="block.blocked_by_user"
								:to="{
									name: 'profile.overview',
									params: { username: block.blocked_by_user.username },
								}"
								class="-user-link"
							>
								<AppUserCardHover :user="block.blocked_by_user">
									<span class="-user-link">
										<AppUserAvatarImg
											class="-avatar"
											:user="block.blocked_by_user"
										/>
										<span class="-user-link-name">
											@{{ block.blocked_by_user.username }}
										</span>
									</span>
								</AppUserCardHover>
							</router-link>
							<span v-else> - </span>
						</td>

						<td class="-info">
							<AppTimeAgo :date="block.blocked_on" />
						</td>

						<td class="-info">
							<AppTranslate v-if="!block.doesExpire"> Never </AppTranslate>
							<AppTimeAgo v-else :date="block.expires_on" is-future />
						</td>

						<td>
							<AppJolticon
								v-app-tooltip="$gettext(`Lift Block`)"
								class="-lift"
								icon="remove"
								@click="onClickLift(block)"
							/>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<AppPagination
			:total-items="totalCount"
			:current-page="page"
			:items-per-page="perPage"
			prevent-url-change
			@pagechange="onPageChanged"
		/>
	</AppCommunitiesViewPageContainer>
</template>

<style lang="stylus" scoped>
.table
	margin-top: 20px

.-row > td
	border-bottom: $border-width-base solid var(--theme-bg-offset)

.-header
	*
		vertical-align: middle
		cursor: pointer

.-user-link
	display: inline-flex
	align-items: center
	max-width: 184px

	&-name
		text-overflow()

.-info
	min-width: 100px

.-avatar
	flex: none
	display: inline-block
	width: $line-height-computed
	margin-right: 6px

.-lift
	cursor: pointer
</style>
