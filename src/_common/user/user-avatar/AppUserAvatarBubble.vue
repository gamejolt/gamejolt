<script lang="ts" setup>
import { computed, CSSProperties } from 'vue';

import AppAvatarFrame from '~common/avatar/AppAvatarFrame.vue';
import { AvatarFrameModel } from '~common/avatar/frame.model';
import { ComponentProps } from '~common/component-helpers';
import { WttfBaseUrl } from '~common/environment/environment.service';
import { ThemeColor } from '~common/theme/variables';
import AppUserVerifiedWrapper from '~common/user/AppUserVerifiedWrapper.vue';
import { UserCommonFields } from '~common/user/user.model';
import AppUserAvatarImg from '~common/user/user-avatar/AppUserAvatarImg.vue';
import { styleChangeBg } from '~styles/mixins';

type Props = {
	user: UserCommonFields | null;
	bgColor?: ThemeColor;
	disableLink?: boolean;
	/**
	 * Shows verified tick or creator badge when available.
	 */
	showVerified?: boolean;
	verifiedOffset?: number;
	verifiedSize?: 'big' | 'small' | 'tiny';
	verifiedPosition?: ComponentProps<typeof AppUserVerifiedWrapper>['position'];
	/**
	 * Shows an avatar frame around the avatar when available.
	 */
	showFrame?: boolean;
	/**
	 * Allows overriding the avatar frame to display something other than what
	 * the User has equipped.
	 */
	frameOverride?: Pick<AvatarFrameModel, 'image_url' | 'scale'>;
	/**
	 * Treats the frame as a border that insets our avatar instead of the having
	 * the frame extend the container bounds.
	 */
	smoosh?: boolean;
	imgWrapperStyles?: CSSProperties;
	tag?: string;
};
const {
	user,
	bgColor = 'bg',
	disableLink = false,
	showVerified = false,
	verifiedOffset,
	verifiedSize,
	showFrame = false,
	frameOverride,
	smoosh = false,
	imgWrapperStyles = {},
	tag = 'div',
} = defineProps<Props>();

const avatarFrame = computed(() => frameOverride || user?.avatar_frame || null);
const maySmooshFrame = computed(() => !!avatarFrame.value && showFrame && smoosh);

const href = computed(() => {
	if (disableLink || !user) {
		return undefined;
	}

	return WttfBaseUrl + '/@' + user.username;
});
</script>

<template>
	<!-- AppUserAvatarBubble -->
	<div>
		<component :is="href ? 'a' : tag" :href="href">
			<AppUserVerifiedWrapper
				:user="user"
				:hide-tick="!showVerified"
				:tick-offset="verifiedOffset ?? (maySmooshFrame ? 0 : undefined)"
				:position="verifiedPosition"
				:big="verifiedSize === 'big'"
				:small="verifiedSize === 'small'"
				:tiny="verifiedSize === 'tiny'"
			>
				<AppAvatarFrame :frame="avatarFrame" :hide-frame="!showFrame" :smoosh="smoosh">
					<div
						:style="{
							...styleChangeBg(bgColor),
							borderRadius: `50%`,
							overflow: `hidden`,
							// Some containers end up adjusting the size of this avatar
							// and break things, even if width and height on the parent
							// are assigned to 1:1 ratios.
							lineHeight: 0,
							...imgWrapperStyles,
						}"
					>
						<slot>
							<AppUserAvatarImg
								class="_img"
								:style="{ borderRadius: `50%` }"
								:user="user"
							/>
						</slot>
					</div>
				</AppAvatarFrame>
			</AppUserVerifiedWrapper>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
._img
	&
	:deep(img)
		width: 100%
		height: 100%
</style>
