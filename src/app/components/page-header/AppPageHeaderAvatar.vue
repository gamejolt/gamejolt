<script lang="ts" setup>
import { PropType } from 'vue';
import AppUserAvatar from '../../../_common/user/user-avatar/AppUserAvatar.vue';
import AppUserAvatarBubble from '../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../_common/user/user.model';
import { styleWhen } from '../../../_styles/mixins';

defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
	disableLink: {
		type: Boolean,
	},
});
</script>

<template>
	<AppUserAvatarBubble
		:user="user"
		show-frame
		show-verified
		verified-size="big"
		:verified-offset="0"
		:disable-link="disableLink"
	>
		<div
			:style="{
				borderRadius: `50%`,
				backgroundColor: `#fff`,
				display: `flex`,
				alignItems: `center`,
				justifyContent: `center`,
				overflow: `hidden`,
				width: `100%`,
				height: `100%`,
				// We want to separate the avatar from the page header styling,
				// but only if they don't have a frame already.
				...styleWhen(!user.avatar_frame, {
					border: `5px solid #fff`,
				}),
			}"
		>
			<slot>
				<AppUserAvatar :user="user" />
			</slot>
		</div>
	</AppUserAvatarBubble>
</template>
