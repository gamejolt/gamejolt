<script lang="ts">
import { computed, PropType, toRefs } from 'vue';

import { defineDynamicSlotProps, useDynamicSlots } from '~common/component-helpers';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleMaxWidthForOptions } from '~styles/mixins';
import { kFontSizeLarge } from '~styles/variables';
import { isInstance } from '~utils/utils';

const Slots = ['avatar', 'supertitle', 'title'] as const;
</script>

<script lang="ts" setup>
// TODO defineProps-migration: uses spread of defineDynamicSlotProps (runtime helper)
const props = defineProps({
	avatarHeight: {
		type: Number,
		default: 36,
		validator: (val: number) => val > 0,
	},
	avatarAspectRatio: {
		type: Number,
		default: 1,
	},
	center: {
		type: Boolean,
	},
	/**
	 * Used to create default slots for avatar and supertitle.
	 */
	slotData: {
		type: Object as PropType<UserModel>,
		default: undefined,
	},
	...defineDynamicSlotProps(Slots, true),
});

const { avatarAspectRatio, avatarHeight, center, dynamicSlots } = toRefs(props);
const { hasSlot } = useDynamicSlots(dynamicSlots);

const maxWidth = computed(() =>
	styleMaxWidthForOptions({
		ratio: avatarAspectRatio.value,
		maxHeight: avatarHeight.value,
	})
);
</script>

<template>
	<div class="flex items-center" :class="{ 'justify-center': center }">
		<div
			v-if="hasSlot('avatar')"
			:style="{
				...maxWidth,
				height: `${avatarHeight}px`,
				flexGrow: 1,
				flexShrink: 0,
				flexBasis: `100%`,
			}"
		>
			<slot name="avatar">
				<template v-if="isInstance(slotData, UserModel)">
					<AppUserAvatarBubble
						:user="slotData"
						disable-link
						show-frame
						show-verified
						smoosh
					/>
				</template>
			</slot>
		</div>

		<AppSpacer :scale="3" horizontal />

		<div class="min-w-0">
			<div
				v-if="hasSlot('supertitle') && ($slots.supertitle || !!slotData)"
				class="truncate text-[12px] font-bold"
			>
				<slot name="supertitle">
					<template v-if="isInstance(slotData, UserModel)">
						{{ '@' + $gettext(`%{ username }'s`, { username: slotData.username }) }}
					</template>
				</slot>
			</div>
			<div
				v-if="hasSlot('title') && $slots.title"
				class="truncate"
				:style="{
					fontSize: `${kFontSizeLarge.value + 1}px`,
					fontWeight: `bolder`,
				}"
			>
				<slot name="title" />
			</div>
		</div>
	</div>
</template>
