<script lang="ts" setup>
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import { kThemeFg } from '../../../_common/theme/variables';
import { User } from '../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import { styleBorderRadiusCircle, styleChangeBg } from '../../../_styles/mixins';
import { ChatUser } from '../chat/user';

const props = defineProps({
	user: {
		type: [Object, undefined] as PropType<User | ChatUser | undefined>,
		required: true,
	},
	position: {
		type: String as PropType<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>,
		default: 'bottom-right',
	},
	hideTick: {
		type: Boolean,
	},
	tickOffset: {
		type: Number,
		default: 20,
	},
	big: {
		type: Boolean,
	},
	small: {
		type: Boolean,
	},
	tiny: {
		type: Boolean,
	},
});

const { user, position, hideTick, tickOffset, big, small, tiny } = toRefs(props);

const styleFloatingTickPosition = computed(() => {
	const result: CSSProperties = {
		position: `absolute`,
		pointerEvents: `all`,
	};

	const pos = position.value;
	const dash = pos.indexOf('-');
	const vPos = pos.slice(0, dash);
	const hPos = pos.slice(dash + 1, pos.length);

	const inset = 0;
	const offset = tickOffset.value;

	let translateX = 0;
	let translateY = 0;

	if (vPos === 'top' || vPos === 'bottom') {
		result[vPos] = inset;
		translateY = vPos === 'top' ? -offset : vPos === 'bottom' ? offset : 0;
	}
	if (hPos === 'left' || hPos === 'right') {
		result[hPos] = inset;
		translateX = hPos === 'left' ? -offset : hPos === 'right' ? offset : 0;
	}

	result['transform'] = `translate(${translateX}%, ${translateY}%)`;
	return result;
});
</script>

<template>
	<!-- UserVerifiedWrapper -->
	<div
		:style="{
			position: `relative`,
		}"
	>
		<div
			:style="{
				zIndex: 1,
			}"
		>
			<slot name="default" />
		</div>

		<AppUserVerifiedTick
			v-if="user && !hideTick"
			:style="{
				...styleChangeBg('bg'),
				...styleBorderRadiusCircle,
				...styleFloatingTickPosition,
				margin: 0,
				padding: `1px`,
				color: kThemeFg,
				zIndex: 2,
			}"
			:user="user"
			:big="big"
			:small="small"
			:tiny="tiny"
		/>
	</div>
</template>
