<script lang="ts" setup>
import { PropType } from 'vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import { styleBorderRadiusCircle, styleChangeBg } from '../../../../_styles/mixins';
import { ChatUser } from '../../chat/user';
import AppChatListItem from '../../chat/_list/AppChatListItem.vue';
import AppUserAvatarBubble from '../../user/AppUserAvatarBubble.vue';

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
			<AppUserAvatarBubble
				:style="{
					width: `100%`,
					height: `100%`,
				}"
				:user="user"
				disable-link
				show-frame
				smoosh
			/>
		</template>

		<template #leading-float>
			<AppUserVerifiedTick
				:style="{
					...styleChangeBg('bg'),
					...styleBorderRadiusCircle,
					padding: `1px`,
					transform: `translate(2px, 2px)`,
				}"
				:user="user"
				small
				vertical-align
			/>
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
