<script lang="ts">
import AppAnimElectricity from '~common/animation/AppAnimElectricity.vue';
import { formatFuzzynumberOverThreshold } from '~common/filters/fuzzynumber';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { useCommonStore } from '~common/store/common-store';
import AppTopSupportersHeader from '~common/supporters/AppTopSupportersHeader.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

export interface TopSupporter {
	user: UserModel;

	/**
	 * Times this user has supported in the last 30 days.
	 */
	value: number;
}

export interface OwnSupport {
	/**
	 * Times you've supported in the last 30 days.
	 */
	lastPeriod: number;

	/**
	 * Total times you've supported a user.
	 */
	total: number;
}
</script>

<script lang="ts" setup>
type Props = {
	supporters: TopSupporter[];
	ownSupport: OwnSupport;
	insetHeader?: boolean;
};
const { supporters, ownSupport, insetHeader = false } = defineProps<Props>();

const { user: myUser } = useCommonStore();
</script>

<template>
	<div>
		<AppTopSupportersHeader v-if="!insetHeader" />

		<div class="change-bg-bg rounded-lg px-[16px] py-[12px]">
			<AppTopSupportersHeader v-if="insetHeader" small />

			<div class="flex gap-[16px]">
				<RouterLink
					v-for="{ user, value } of supporters"
					:key="user.id"
					class="flex flex-1 flex-col items-center justify-end min-w-0 text-fg"
					:to="user.routeLocation"
				>
					<div class="w-full max-w-[64px]">
						<AppUserCardHover :user="user">
							<AppUserAvatarBubble :user="user" show-frame smoosh />
						</AppUserCardHover>
					</div>

					<AppSpacer vertical :scale="1" />

					<div
						v-app-tooltip="'@' + user.username"
						class="truncate max-w-full min-w-0 text-sm"
					>
						{{ '@' + user.username }}
					</div>

					<AppSpacer vertical :scale="2" />

					<AppAnimElectricity
						class="change-bg-bg-offset rounded min-w-[32px] px-[6px] py-0 font-bold inline-flex justify-center text-sm"
						shock-anim="wide-rect"
					>
						{{ formatFuzzynumberOverThreshold(value, 10_000) }}
					</AppAnimElectricity>
				</RouterLink>
			</div>

			<template v-if="!!myUser && ownSupport.total > 0">
				<div
					class="flex flex-row items-center justify-center gap-[8px] text-tiny text-fg-muted mt-[12px] mb-[8px]"
				>
					{{ $gettext(`Your stats`) }}

					<div class="flex-auto h-[1px] bg-[rgba(var(--theme-fg-rgb),0.1)]" />
				</div>

				<div
					class="flex flex-1 flex-row items-center justify-start min-w-0 gap-[12px] text-fg"
				>
					<AppUserAvatarBubble
						class="flex-auto max-w-[56px]"
						:user="myUser"
						show-frame
						smoosh
					/>

					<div
						v-for="data in [
							{
								count: ownSupport.lastPeriod,
								label: $gettext('Last 30 days'),
							},
							{
								count: ownSupport.total,
								label: $gettext('All time'),
							},
						]"
						:key="data.label"
						class="flex-[1_1_0] whitespace-nowrap self-center"
					>
						<div class="text-fg-muted text-sm">
							{{ data.label }}
						</div>

						<AppAnimElectricity
							class="change-bg-bg-offset rounded min-w-[32px] px-[6px] py-0 font-bold inline-flex justify-center text-sm"
							shock-anim="wide-rect"
						>
							{{ formatFuzzynumberOverThreshold(data.count, 10_000) }}
						</AppAnimElectricity>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
