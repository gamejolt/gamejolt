<script lang="ts" setup>
import { FeaturedItemModel } from '~app/components/featured-item/featured-item.model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import { styleBorderRadiusBase } from '~styles/mixins';

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
