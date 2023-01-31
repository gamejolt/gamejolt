<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppAvatarFrame from '../../../_common/avatar/AppAvatarFrame.vue';
import { ComponentProps } from '../../../_common/component-helpers';
import { Environment } from '../../../_common/environment/environment.service';
import { ThemeColor } from '../../../_common/theme/variables';
import AppUserAvatarImg, {
	assetGuestImage,
} from '../../../_common/user/user-avatar/AppUserAvatarImg.vue';
import { User } from '../../../_common/user/user.model';
import { styleBorderRadiusCircle, styleChangeBg } from '../../../_styles/mixins';
import { ChatUser } from '../chat/user';
import AppUserVerifiedWrapper from './AppUserVerifiedWrapper.vue';

const props = defineProps({
	user: {
		type: [Object, null, undefined] as PropType<User | ChatUser | null | undefined>,
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
	 * Allows extra inset to be added/removed from the avatar frame.
	 *
	 * Has no effect if {@link showFrame} is `false`.
	 */
	frameInset: {
		type: Number,
		validator: value => value === undefined || typeof value === 'number',
		default: undefined,
	},
	frameShrinkOnShow: {
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
	frameInset,
	frameShrinkOnShow,
} = toRefs(props);

const avatarFrame = computed(() => (isChatUser(user.value) ? undefined : user.value?.avatar_frame));

const mayShrinkFrame = computed(
	() =>
		!isChatUser(user.value) &&
		!!user.value?.avatar_frame &&
		showFrame.value &&
		frameShrinkOnShow.value
);

const href = computed(() => {
	if (disableLink.value || !user.value) {
		return undefined;
	}

	if (!link?.value) {
		return Environment.wttfBaseUrl + user.value.url;
	} else if (link.value === 'dashboard') {
		return Environment.wttfBaseUrl;
	} else if (link.value === 'fireside') {
		return Environment.firesideBaseUrl + '/@' + user.value.username;
	}
});

function isChatUser(user: typeof props.user): user is ChatUser {
	return user instanceof ChatUser;
}
</script>

<template>
	<!-- AppUserAvatarBubble -->
	<div>
		<component :is="href ? 'a' : 'div'" :href="href">
			<AppUserVerifiedWrapper
				:user="user"
				:hide-tick="!showVerified"
				:tick-offset="verifiedOffset ?? (mayShrinkFrame ? 0 : undefined)"
				:position="verifiedPosition"
				:big="verifiedSize === 'big'"
				:small="verifiedSize === 'small'"
				:tiny="verifiedSize === 'tiny'"
			>
				<AppAvatarFrame
					:frame="avatarFrame"
					:hide-frame="!showFrame"
					:inset="frameInset"
					:shrink-on-show="frameShrinkOnShow"
				>
					<div
						:style="{
							...styleBorderRadiusCircle,
							...styleChangeBg(bgColor),
						}"
					>
						<slot>
							<template v-if="isChatUser(user)">
								<img v-if="user.img_avatar" :src="user.img_avatar" alt="" />
								<img v-else :src="assetGuestImage" alt="" />
							</template>
							<AppUserAvatarImg v-else :user="user" />
						</slot>
					</div>
				</AppAvatarFrame>
			</AppUserVerifiedWrapper>
		</component>
	</div>
</template>
