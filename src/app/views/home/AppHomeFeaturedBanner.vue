<script lang="ts" setup>
import { PropType } from 'vue';
import AppImgResponsive from '../../../_common/img/AppImgResponsive.vue';
import { styleBorderRadiusBase } from '../../../_styles/mixins';
import { FeaturedItem } from '../../components/featured-item/featured-item.model';

defineProps({
	featuredItem: {
		type: Object as PropType<FeaturedItem>,
		required: true,
	},
});
</script>

<template>
	<a
		v-if="featuredItem.banner_url && featuredItem.banner_media_item"
		:style="{ display: `block` }"
		:href="featuredItem.banner_url"
	>
		<AppImgResponsive
			:style="{ ...styleBorderRadiusBase }"
			:src="featuredItem.banner_media_item.mediaserver_url"
			:width="featuredItem.banner_media_item.width"
			:height="featuredItem.banner_media_item.height"
		/>
	</a>
</template>
