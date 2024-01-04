<script lang="ts">
import { PropType } from 'vue';
import {
	styleBorderRadiusBase,
	styleBorderRadiusLg,
	styleChangeBg,
	styleFlexCenter,
	styleTextOverflow,
} from '../../_styles/mixins';
import { kBorderWidthSm, kFontSizeSmall, kFontSizeTiny } from '../../_styles/variables';
import AppAnimElectricity from '../animation/AppAnimElectricity.vue';
import { formatFuzzynumberOverThreshold } from '../filters/fuzzynumber';
import AppSpacer from '../spacer/AppSpacer.vue';
import { useCommonStore } from '../store/common-store';
import { kThemeFg, kThemeFg10, kThemeFgMuted } from '../theme/variables';
import { vAppTooltip } from '../tooltip/tooltip-directive';
import AppUserCardHover from '../user/card/AppUserCardHover.vue';
import AppUserAvatarBubble from '../user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../user/user.model';
import AppTopSupportersHeader from './AppTopSupportersHeader.vue';

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
defineProps({
	supporters: {
		type: Array as PropType<TopSupporter[]>,
		required: true,
	},
	ownSupport: {
		type: Object as PropType<OwnSupport>,
		required: true,
	},
	insetHeader: {
		type: Boolean,
	},
});

const { user: myUser } = useCommonStore();
</script>

<template>
	<div>
		<AppTopSupportersHeader v-if="!insetHeader" />

		<div
			:style="{
				...styleBorderRadiusLg,
				...styleChangeBg('bg'),
				padding: `12px 16px`,
			}"
		>
			<AppTopSupportersHeader v-if="insetHeader" small />

			<div
				:style="{
					display: `flex`,
					gap: `16px`,
				}"
			>
				<RouterLink
					v-for="{ user, value } of supporters"
					:key="user.id"
					:style="{
						flex: 1,
						display: `flex`,
						flexDirection: `column`,
						alignItems: `center`,
						justifyContent: `flex-end`,
						minWidth: 0,
						color: kThemeFg,
					}"
					:to="user.routeLocation"
				>
					<div
						:style="{
							width: `100%`,
							maxWidth: `64px`,
						}"
					>
						<AppUserCardHover :user="user">
							<AppUserAvatarBubble :user="user" show-frame smoosh />
						</AppUserCardHover>
					</div>

					<AppSpacer vertical :scale="1" />

					<div
						v-app-tooltip="'@' + user.username"
						:style="{
							...styleTextOverflow,
							maxWidth: `100%`,
							minWidth: `0`,
							fontSize: kFontSizeSmall.px,
						}"
					>
						{{ '@' + user.username }}
					</div>

					<AppSpacer vertical :scale="2" />

					<AppAnimElectricity
						:style="{
							...styleBorderRadiusBase,
							...styleChangeBg('bg-offset'),
							minWidth: `32px`,
							padding: `0px 6px`,
							fontWeight: `bold`,
							display: `inline-flex`,
							justifyContent: `center`,
							fontSize: kFontSizeSmall.px,
						}"
						shock-anim="wide-rect"
					>
						{{ formatFuzzynumberOverThreshold(value, 10_000) }}
					</AppAnimElectricity>
				</RouterLink>
			</div>

			<template v-if="!!myUser && ownSupport.total > 0">
				<div
					:style="{
						...styleFlexCenter({ direction: `row` }),
						gap: `8px`,
						fontSize: kFontSizeTiny.px,
						color: kThemeFgMuted,
						marginTop: `12px`,
						marginBottom: `8px`,
					}"
				>
					{{ $gettext(`Your stats`) }}

					<div
						:style="{
							flex: `auto`,
							background: kThemeFg10,
							height: kBorderWidthSm.px,
						}"
					/>
				</div>

				<div
					:style="{
						flex: 1,
						display: `flex`,
						flexDirection: `row`,
						alignItems: `center`,
						justifyContent: `flex-start`,
						minWidth: 0,
						gap: `12px`,
						color: kThemeFg,
					}"
				>
					<AppUserAvatarBubble
						:style="{
							flex: `auto`,
							maxWidth: `56px`,
						}"
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
						:style="{
							flex: `1 1 0`,
							whiteSpace: `nowrap`,
							alignSelf: `center`,
						}"
					>
						<div
							:style="{
								color: kThemeFgMuted,
								fontSize: kFontSizeSmall.px,
							}"
						>
							{{ data.label }}
						</div>

						<AppAnimElectricity
							:style="{
								...styleBorderRadiusBase,
								...styleChangeBg('bg-offset'),
								minWidth: `32px`,
								padding: `0px 6px`,
								fontWeight: `bold`,
								display: `inline-flex`,
								justifyContent: `center`,
								fontSize: kFontSizeSmall.px,
							}"
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
