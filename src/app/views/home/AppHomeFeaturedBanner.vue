<script lang="ts" setup>
import { FeaturedItemModel } from '~app/components/featured-item/featured-item.model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';

type Props = {
	featuredItem: FeaturedItemModel;
};
const { featuredItem } = defineProps<Props>();
</script>

<template>
	<a
		v-if="featuredItem.banner_url && featuredItem.banner_media_item"
		class="block"
		:href="featuredItem.banner_url"
	>
		<AppImgResponsive
			class="rounded"
			:src="featuredItem.banner_media_item.mediaserver_url"
			:width="featuredItem.banner_media_item.width"
			:height="featuredItem.banner_media_item.height"
		/>
	</a>
</template>
