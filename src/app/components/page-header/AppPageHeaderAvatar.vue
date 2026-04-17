<script lang="ts" setup>
import { UserModel } from '~common/user/user.model';
import AppUserAvatar from '~common/user/user-avatar/AppUserAvatar.vue';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

type Props = {
	user: UserModel;
	disableLink?: boolean;
};
defineProps<Props>();
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
				border: !user.avatar_frame ? `5px solid #fff` : undefined,
			}"
		>
			<slot>
				<AppUserAvatar :user="user" />
			</slot>
		</div>
	</AppUserAvatarBubble>
</template>
