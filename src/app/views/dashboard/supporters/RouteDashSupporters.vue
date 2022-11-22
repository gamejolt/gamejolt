<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { Supporter } from '../../../../_common/supporter/supporter.model';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';

export default {
	...defineAppRouteOptions({
		resolver: () =>
			Api.sendFieldsRequest('/mobile/supporter', {
				supporters: true,
			}),
	}),
};
</script>

<script lang="ts" setup>
// interface Supporter {
// 	key: number;
// 	event: EventItem;
// 	from: User;
// 	post?: FiresidePost;
// 	fireside?: Fireside;
// 	message?: unknown;
// }

const supporters = ref<Supporter[]>([]);

createAppRoute({
	routeTitle: computed(() => `Supporters`),
	onResolved({ payload }) {
		supporters.value = Supporter.populate(payload.supporters);

		// const events = EventItem.populate<EventItem>(payload.events);

		// supporters.value = events.map(event => ({
		// 	key: event.id,
		// 	event,
		// 	from: event.from as User,
		// 	post: event.action instanceof FiresidePost ? event.action : undefined,
		// 	fireside: event.action instanceof Fireside ? event.action : undefined,
		// 	// TODO
		// 	message: undefined,
		// }));
	},
});
</script>

<template>
	<AppShellPageBackdrop>
		<div class="container">
			<h1 class="sans-margin-bottom">
				{{ $gettext(`Latest Supporters`) }}
			</h1>

			<AppSpacer vertical :scale="10" />

			<template v-for="supporter of supporters" :key="supporter.key">
				<div class="-item-wrapper">
					<div class="-support-type">
						<AppJolticon icon="sticker-filled" />
						{{ $gettext(`Charged sticker`) }}
					</div>

					<div class="-item sheet sheet-offset">
						<div class="-user">
							<div class="-user-avatar">
								<AppUserAvatarImg :user="supporter.from" />
							</div>
							@{{ supporter.from.username }}
						</div>
						<div class="-content">
							<!-- <template v-if="supporter.post">
								<div class="-content-type">
									{{ $gettext(`Post`) }}
								</div>
								<div>
									<RouterLink :to="supporter.post.routeLocation">
										{{ supporter.post.getShortLead() }}
									</RouterLink>
								</div>
							</template>
							<template v-else-if="supporter.fireside">
								<div class="-content-type">
									{{ $gettext(`Fireside`) }}
								</div>
								<div>
									{{ supporter.fireside.title }}
								</div>
							</template> -->
						</div>
						<div class="-thanks">
							<AppButton>
								{{ $gettext(`Say thanks`) }}
							</AppButton>
						</div>
					</div>
				</div>

				<AppSpacer vertical :scale="8" />
			</template>
		</div>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-item-wrapper
	position: relative

.-support-type
	rounded-corners()
	position: absolute
	font-size: $font-size-small
	background-color: var(--theme-bg-offset)
	height: 30px
	line-height: 30px
	padding: 0 8px
	left: 8px
	top: -(@height / 2 + 4px)

.-item
	display: flex
	grid-gap: 32px
	margin: 0

.-user
	width: 20%
	flex: none

	display: flex
	grid-gap: 8px
	align-items: center
	font-weight: bold

.-user-avatar
	width: 36px
	flex: none

.-content
	flex: auto

.-content-type
	font-size: $font-size-small
	color: var(--theme-fg-muted)

.-thanks
	flex: none
</style>
