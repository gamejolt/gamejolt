<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRaw, toRefs } from 'vue';
import AppAvatarFrame from '../../../_common/avatar/AppAvatarFrame.vue';
import { AvatarFrame } from '../../../_common/avatar/frame.model';
import { ComponentProps } from '../../../_common/component-helpers';
import { Environment } from '../../../_common/environment/environment.service';
import { imageGuestAvatar } from '../../../_common/img/images';
import { ThemeColor } from '../../../_common/theme/variables';
import AppUserAvatarImg from '../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { User } from '../../../_common/user/user.model';
import { styleBorderRadiusCircle, styleChangeBg } from '../../../_styles/mixins';
import { ChatUser } from '../chat/user';
import AppUserVerifiedWrapper from './AppUserVerifiedWrapper.vue';

const props = defineProps({
	user: {
		type: [Object, null] as PropType<User | ChatUser | null>,
		required: true,
	},
	bgColor: {
		type: String as PropType<ThemeColor>,
		default: 'bg',
	},
	link: {
		type: String,
		default: undefined,
	},
	disableLink: {
		type: Boolean,
	},
	/**
	 * Shows verified tick or creator badge when available.
	 */
	showVerified: {
		type: Boolean,
	},
	verifiedOffset: {
		type: Number,
		default: undefined,
	},
	verifiedSize: {
		type: String as PropType<'big' | 'small' | 'tiny'>,
		default: undefined,
	},
	verifiedPosition: {
		type: String as PropType<ComponentProps<typeof AppUserVerifiedWrapper>['position']>,
		default: undefined,
	},
	/**
	 * Shows an avatar frame around the avatar when available.
	 */
	showFrame: {
		type: Boolean,
	},
	/**
	 * Allows overriding the avatar frame to display something other than what
	 * the User has equipped.
	 */
	frameOverride: {
		type: Object as PropType<AvatarFrame>,
		default: undefined,
	},
	/**
	 * Allows extra inset to be added/removed from the avatar frame.
	 *
	 * Has no effect if {@link showFrame} is `false`.
	 */
	frameInset: {
		type: Number,
		validator: value => value === undefined || typeof value === 'number',
		default: undefined,
	},
	/**
	 * Treats the frame as a border that insets our avatar instead of the having
	 * the frame extend the container bounds.
	 */
	smoosh: {
		type: Boolean,
	},
});

const {
	user,
	bgColor,
	link,
	disableLink,
	showVerified,
	verifiedOffset,
	verifiedSize,
	showFrame,
	frameOverride,
	frameInset,
	smoosh,
} = toRefs(props);

const chatAvatarStyles: CSSProperties = {
	...styleBorderRadiusCircle,
};

const avatarFrame = computed(() => frameOverride?.value || user.value?.avatar_frame || null);
const maySmooshFrame = computed(() => !!avatarFrame.value && showFrame.value && smoosh.value);

const href = computed(() => {
	if (disableLink.value || !user.value) {
		return undefined;
	}

	if (!link?.value) {
		return Environment.wttfBaseUrl + user.value.url;
	} else if (link.value === 'dashboard') {
		return Environment.wttfBaseUrl;
	}
});

function isChatUser(user: typeof props.user): user is ChatUser {
	// Proxy values will always fail these instanceof checks, so we need to
	// check the raw value.
	return toRaw(user) instanceof ChatUser;
}
</script>

<template>
	<!-- AppUserAvatarBubble -->
	<div>
		<component :is="href ? 'a' : 'div'" :href="href">
			<AppUserVerifiedWrapper
				:user="user"
				:hide-tick="!showVerified"
				:tick-offset="verifiedOffset ?? (maySmooshFrame ? 0 : undefined)"
				:position="verifiedPosition"
				:big="verifiedSize === 'big'"
				:small="verifiedSize === 'small'"
				:tiny="verifiedSize === 'tiny'"
			>
				<AppAvatarFrame
					:frame="avatarFrame"
					:hide-frame="!showFrame"
					:inset="frameInset"
					:smoosh="smoosh"
				>
					<div
						:style="{
							...styleBorderRadiusCircle,
							...styleChangeBg(bgColor),
							// Some containers end up adjusting the size of this avatar
							// and break things, even if width and height on the parent
							// are assigned to 1:1 ratios.
							lineHeight: 0,
						}"
					>
						<slot>
							<template v-if="isChatUser(user)">
								<img
									class="_img"
									:style="chatAvatarStyles"
									:src="user.img_avatar || imageGuestAvatar"
									alt=""
								/>
							</template>
							<AppUserAvatarImg
								v-else
								class="_img"
								:style="chatAvatarStyles"
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
	::v-deep(img)
		width: 100%
		height: 100%
</style>
