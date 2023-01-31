<script lang="ts">
import { PropType, ref } from 'vue';
import { User } from '../user.model';
import guestImage from './guest.png';

export const assetGuestImage = guestImage;
</script>

<script lang="ts" setup>
defineProps({
	user: {
		type: Object as PropType<User | null | undefined>,
		default: undefined,
	},
});

const hasError = ref(false);
</script>

<template>
	<span class="user-avatar-img">
		<img
			v-if="user && !hasError"
			:src="user.img_avatar"
			class="img-responsive"
			alt=""
			@error="hasError = true"
		/>
		<img v-else :src="assetGuestImage" class="img-responsive" alt="" />
	</span>
</template>

<style lang="stylus" scoped>
.user-avatar-img
	display: block
	position: relative

	img
		img-responsive()
		img-circle()
</style>
