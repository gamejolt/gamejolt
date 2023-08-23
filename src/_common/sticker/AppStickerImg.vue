<script lang="ts" setup>
import AppImgResponsive from '../img/AppImgResponsive.vue';

defineProps({
	src: {
		type: String,
		required: true,
	},
	alt: {
		type: String,
		default: '',
	},
});
</script>

<template>
	<AppImgResponsive
		:style="{ userDrag: `none` }"
		:src="src"
		:hi-dpi-options="{
			dpiCheck: 'loose',
		}"
		:alt="alt"
		draggable="false"
		onmousedown="return false"
		@dragstart.prevent
	/>
</template>
