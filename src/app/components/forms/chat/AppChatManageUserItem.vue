<script lang="ts" setup>
import { PropType } from 'vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import { ChatUser } from '../../chat/user';
import AppChatListItem from '../../chat/_list/AppChatListItem.vue';

defineProps({
	user: {
		type: Object as PropType<ChatUser>,
		required: true,
	},
});

const emit = defineEmits({
	click: () => true,
	hover: () => true,
	unhover: () => true,
});
</script>

<template>
	<AppChatListItem
		:horizontal-padding="16"
		popper-trigger="manual"
		:defined-slots="['leading', 'title', 'trailing']"
		@mouseenter="emit('hover')"
		@mouseleave="emit('unhover')"
		@click="emit('click')"
	>
		<template #leading>
			<div class="-member-avatar">
				<img class="-member-avatar-img" :src="user.img_avatar" />
			</div>
		</template>

		<template #leading-float>
			<AppUserVerifiedTick class="-verified-tick" :user="user" small vertical-align />
		</template>

		<template #title>
			<span>{{ user.display_name }}</span>
			<span class="tiny text-muted">@{{ user.username }}</span>
		</template>

		<template #trailing>
			<slot name="trailing" />
		</template>
	</AppChatListItem>
</template>

<style lang="stylus" scoped>
.-member-avatar
.-member-avatar-img
	width: 100%
	height: 100%

.-verified-tick
	change-bg(bg)
	img-circle()
	padding: 1px
	transform: translate(2px, 2px)
</style>
