<script lang="ts">
import { createComponent } from '@vue/composition-api';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import { Community } from '../../community.model';
import { requiredProp } from '../../../../utils/vue';

const AppCommunityThumbnailImg = createComponent({
	components: {
		AppImgResponsive,
	},
	props: {
		community: requiredProp(Community),
	},
});

export default AppCommunityThumbnailImg;
</script>

<template>
	<AppImgResponsive :src="community.img_thumbnail" class="community-thumbnail-img" alt="" />
</template>
