<script lang="ts" setup>
import { PropType, computed, toRefs } from 'vue';
import { styleMaxWidthForOptions, styleTextOverflow, styleWhen } from '../../_styles/mixins';
import { kFontSizeLarge } from '../../_styles/variables';
import { isInstance } from '../../utils/utils';
import AppSpacer from '../spacer/AppSpacer.vue';
import AppUserAvatarBubble from '../user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../user/user.model';

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
});

const { avatarAspectRatio, avatarHeight, center } = toRefs(props);

const maxWidth = computed(() =>
	styleMaxWidthForOptions({
		ratio: avatarAspectRatio.value,
		maxHeight: avatarHeight.value,
	})
);
</script>

<template>
	<div
		:style="{
			display: `flex`,
			alignItems: `center`,
			...styleWhen(center, {
				justifyContent: `center`,
			}),
		}"
	>
		<div
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

		<div :style="{ minWidth: 0 }">
			<div
				v-if="$slots.supertitle || !!slotData"
				:style="{
					fontSize: `12px`,
					fontWeight: `bold`,
					...styleTextOverflow,
				}"
			>
				<slot name="supertitle">
					<template v-if="isInstance(slotData, UserModel)">
						{{ '@' + $gettext(`%{ username }'s`, { username: slotData.username }) }}
					</template>
				</slot>
			</div>
			<div
				v-if="$slots.title"
				:style="{
					fontSize: `${kFontSizeLarge.value + 1}px`,
					fontWeight: `bolder`,
					...styleTextOverflow,
				}"
			>
				<slot name="title" />
			</div>
		</div>
	</div>
</template>
