<script lang="ts" setup>
import { PropType } from 'vue';
import { User } from '../user.model';
import TestImage from './test-frame.png';

defineProps({
	user: {
		type: Object as PropType<User>,
		required: true,
	},
});
</script>

<template>
	<div
		:style="{
			position: `relative`,
		}"
	>
		<img
			:style="{
				position: `absolute`,
				top: `-5%`,
				right: `-5%`,
				bottom: `-5%`,
				left: `-5%`,
				width: `110%`,
				height: `110%`,
				pointerEvents: `none`,
				zIndex: 2,
			}"
			:src="TestImage"
			alt="Avatar frame"
		/>
		<slot />
	</div>
</template>
