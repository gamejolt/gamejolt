<script lang="ts" setup>
import AppBackgroundFade from '../../../../_common/background/AppBackgroundFade.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppImgResponsive from '../../../../_common/img/AppImgResponsive.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { kThemeBgOffset, kThemeFg10 } from '../../../../_common/theme/variables';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import {
	styleAbsoluteFill,
	styleElevate,
	styleFlexCenter,
	styleOverlayTextShadow,
	styleTextOverflow,
	styleWhen,
} from '../../../../_styles/mixins';
import { kBorderWidthBase, kFontSizeBase, kFontSizeSmall } from '../../../../_styles/variables';
import { kShellTopNavHeight } from '../../../styles/variables';
import { useProfileRouteStore } from '../RouteProfile.vue';
import AppProfileDogtagAutoscroll from '../dogtags/AppProfileDogtagAutoscroll.vue';
import AppProfileDogtags from '../dogtags/AppProfileDogtags.vue';

const { user: routeUser, hasSales } = useProfileRouteStore()!;
</script>

<template>
	<div
		v-if="routeUser"
		class="anim-fade-in-down anim-fade-leave-up"
		:style="{
			...styleElevate(2),
			position: `fixed`,
			top: kShellTopNavHeight.px,
			left: 0,
			right: 0,
			zIndex: 10,
			backgroundColor: kThemeBgOffset,
			padding: `12px 16px`,
			...styleWhen(!routeUser.header_media_item, {
				borderBottom: `${kBorderWidthBase.px} solid ${kThemeFg10}`,
			}),
		}"
	>
		<!-- Background -->
		<div v-if="routeUser.header_media_item" :style="styleAbsoluteFill({ zIndex: 1 })">
			<AppImgResponsive
				:src="routeUser.header_media_item.mediaserver_url"
				:style="{
					width: `100%`,
					height: `100%`,
					objectFit: `cover`,
					filter: `blur(1.5px)`,
				}"
			/>
			<AppBackgroundFade :fade-opacity="0.3" />
		</div>

		<!-- Content -->
		<div
			:style="{
				position: `relative`,
				zIndex: 2,
			}"
		>
			<div
				:style="{
					display: `flex`,
					columnGap: `12px`,
				}"
			>
				<!-- Avatar -->
				<AppUserAvatarBubble
					:style="{ width: `64px`, flex: `none` }"
					:user="routeUser"
					show-frame
					show-verified
					smoosh
					disable-link
					tag="a"
					@click="Scroll.to(0)"
				/>

				<div :style="{ flex: `auto`, minWidth: 0 }">
					<!-- Display name -->
					<div
						:style="{
							...styleTextOverflow,
							...styleWhen(!!routeUser.header_media_item, {
								...styleOverlayTextShadow,
							}),
							fontWeight: `bold`,
							fontSize: kFontSizeBase.px,
						}"
					>
						{{ routeUser.display_name }}
					</div>
					<!-- Username -->
					<div
						:style="{
							...styleTextOverflow,
							...styleWhen(!!routeUser.header_media_item, {
								...styleOverlayTextShadow,
							}),
							fontSize: kFontSizeSmall.px,
						}"
					>
						@{{ routeUser.username }}
					</div>

					<!-- Dogtags -->
					<AppProfileDogtagAutoscroll>
						<AppProfileDogtags no-wrap />
					</AppProfileDogtagAutoscroll>
				</div>

				<!-- Shop quick-link -->
				<div v-if="hasSales" :style="{ flex: `none`, alignSelf: `center` }">
					<AppButton
						overlay
						sparse
						solid
						:style="{
							width: `48px`,
							height: `48px`,
							fontSize: `32px !important`,
							...styleFlexCenter(),
						}"
						:to="{
							name: 'profile.shop',
							params: {
								username: routeUser.username,
							},
						}"
					>
						<AppJolticon icon="marketplace-filled" :style="{ fontSize: `24px` }" />
					</AppButton>
				</div>
			</div>
		</div>
	</div>
</template>
