<script lang="ts" setup>
import { computed, CSSProperties, PropType, toRefs } from 'vue';
import { styleChangeBg } from '../../_styles/mixins';
import { kThemeFg } from '../theme/variables';
import AppUserVerifiedTick from './AppUserVerifiedTick.vue';
import { UserCommonFields } from './user.model';

interface PositionData {
	vPos: 'top' | 'bottom';
	hPos: 'left' | 'right';
	translateY: number;
	translateX: number;
}

type PositionCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const props = defineProps({
	user: {
		type: [Object, null] as PropType<UserCommonFields | null>,
		required: true,
	},
	position: {
		type: String as PropType<PositionCorner>,
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

const floatingTickPositionStyles = computed(() => {
	const result: CSSProperties = {
		position: `absolute`,
		pointerEvents: `all`,
	};

	const offset = tickOffset.value;
	const inset = 0;

	const data: Record<PositionCorner, PositionData> = {
		'top-left': {
			vPos: 'top',
			hPos: 'left',
			translateX: -offset,
			translateY: -offset,
		},
		'top-right': {
			vPos: 'top',
			hPos: 'right',
			translateX: offset,
			translateY: -offset,
		},
		'bottom-right': {
			vPos: 'bottom',
			hPos: 'right',
			translateX: offset,
			translateY: offset,
		},
		'bottom-left': {
			vPos: 'bottom',
			hPos: 'left',
			translateX: -offset,
			translateY: offset,
		},
	};

	const { hPos, vPos, translateX, translateY } = data[position.value];

	result[hPos] = inset;
	result[vPos] = inset;
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
				...floatingTickPositionStyles,
				margin: 0,
				padding: `1px`,
				borderRadius: `50%`,
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
