<script lang="ts" setup>
import { PropType } from 'vue';
import AppUserVerifiedTick from '../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserCommonFields } from '../../../../_common/user/user.model';
import { styleChangeBg } from '../../../../_styles/mixins';
import AppChatListItem from '../../chat/_list/AppChatListItem.vue';

defineProps({
	user: {
		type: Object as PropType<UserCommonFields>,
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
		:dynamic-slots="['leading', 'title', 'trailing']"
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
					padding: `1px`,
					borderRadius: `50%`,
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
