<script lang="ts" setup>
import { PropType, ref } from 'vue';
import { imageGuestAvatar } from '../../img/images';
import { UserCommonFields } from '../user.model';

defineProps({
	user: {
		type: Object as PropType<UserCommonFields | null | undefined>,
		default: undefined,
	},
});

const hasError = ref(false);
</script>

<template>
	<span
		class="user-avatar-img"
		:style="{
			display: `block`,
			position: `relative`,
		}"
	>
		<img
			v-if="user && !hasError"
			:src="user.img_avatar"
			class="img-responsive"
			:style="{
				borderRadius: `50%`,
			}"
			alt=""
			@error="hasError = true"
		/>
		<img v-else :src="imageGuestAvatar" class="img-responsive" alt="" />
	</span>
</template>
