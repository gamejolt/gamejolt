<script lang="ts" setup>
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import { Community } from '../community.model';
import { PropType } from 'vue';

defineProps({
	community: {
		type: Object as PropType<Community>,
		required: true,
	},
});
</script>

<template>
	<AppImgResponsive :src="community.img_thumbnail" class="community-thumbnail-img" alt="" />
</template>
