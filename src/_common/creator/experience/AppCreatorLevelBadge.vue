<script lang="ts">
import { toRefs } from 'vue';
import shieldImg from './shield.png';
</script>

<script lang="ts" setup>
const props = defineProps({
	level: {
		type: String,
		required: true,
	},
	sm: {
		type: Boolean,
	},
});

const { level, sm } = toRefs(props);
</script>

<template>
	<div
		:style="{
			position: 'relative',
			zIndex: 1,
			width: sm ? '50px' : '100px',
			height: sm ? '50px' : '100px',
			userSelect: 'none',
		}"
	>
		<img :src="shieldImg" :style="{ zIndex: 1, display: 'block', width: '100%' }" />
		<div
			:style="{
				position: 'absolute',
				zIndex: 2,
				top: '0',
				left: '0',
				bottom: '0',
				right: '0',
				color: '#8a430a',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'column',
			}"
		>
			<div
				:style="{
					position: 'absolute',
					marginBottom: sm ? '24px' : '48px',
					fontSize: sm ? '10px' : '15px',
				}"
			>
				Level
			</div>
			<span
				:style="{
					fontFamily: 'Germania',
					fontSize: sm ? '22px' : '40px',
					textShadow: '0 0 4px rgba(80, 40, 0, 0.5)',
					marginTop: sm ? '8px' : '12px',
				}"
			>
				{{ level }}
			</span>
		</div>
	</div>
</template>
