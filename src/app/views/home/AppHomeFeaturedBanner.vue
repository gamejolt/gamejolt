<script lang="ts" setup>
import AppImgResponsive from '../../../_common/img/AppImgResponsive.vue';
import { styleBorderRadiusBase } from '../../../_styles/mixins';
import { FeaturedItemModel } from '../../components/featured-item/featured-item.model';

type Props = {
	featuredItem: FeaturedItemModel;
};
const { featuredItem } = defineProps<Props>();
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
