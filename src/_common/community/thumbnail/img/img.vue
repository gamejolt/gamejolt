<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppImgResponsive from '../../../img/AppImgResponsive.vue';
import { Community } from '../../community.model';

@Options({
	components: {
		AppImgResponsive,
	},
})
export default class AppCommunityThumbnailImg extends Vue {
	@Prop(Object)
	community!: Community;
}
</script>

<template>
	<AppImgResponsive :src="community.img_thumbnail" class="community-thumbnail-img" alt="" />
</template>
