<script lang="ts" setup>
import type { HTMLAttributes } from 'vue';

import AppAspectRatio from '../../aspect-ratio/AppAspectRatio.vue';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/AppMediaItemBackdrop.vue';
import { CommunityModel } from '../community.model';

type Props = {
	community: CommunityModel;
} & /* @vue-ignore */ Pick<HTMLAttributes, 'onClick'>;

const { community } = defineProps<Props>();
</script>

<template>
	<AppAspectRatio :ratio="1">
		<AppMediaItemBackdrop
			:media-item="community.thumbnail"
			radius="full"
			fallback-color="var(--theme-bg-offset)"
		>
			<AppImgResponsive :src="community.img_thumbnail" alt="" />
		</AppMediaItemBackdrop>
	</AppAspectRatio>
</template>
