<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { trackGotoCommunity } from '../../analytics/analytics.service';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import { Community } from '../community.model';
import AppCommunityThumbnailImg from './img/img.vue';

@Options({
	components: {
		AppCommunityThumbnailImg,
		AppMediaItemBackdrop,
	},
})
export default class AppCommunityThumbnail extends Vue {
	@Prop({ type: Object, required: true })
	community!: Community;

	onGotoCommunity() {
		trackGotoCommunity({
			source: 'thumbnail',
			id: this.community.id,
			path: this.community.path,
		});
	}
}
</script>

<template>
	<router-link
		class="-item"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		:title="community.name"
		@click="onGotoCommunity"
	>
		<div class="-thumb">
			<AppMediaItemBackdrop
				class="-thumb-inner"
				:media-item="community.thumbnail"
				radius="full"
			>
				<AppCommunityThumbnailImg class="-thumb-img" :community="community" />
			</AppMediaItemBackdrop>
		</div>

		<div class="-label">
			{{ community.name }}
		</div>
	</router-link>
</template>

<style lang="stylus" scoped>
.-thumb
	img-circle()
	change-bg('bg-offset')
	position: relative
	height: 0
	padding-top: 100%
	overflow: hidden

	&-inner
		position: absolute
		top: 0
		left: 0
		width: 100%
		height: 100%

.-label
	text-overflow()
	theme-prop('color', 'fg')
	font-weight: bold
	text-align: center
	margin-top: 8px

	.-item:hover &
		theme-prop('color', 'link')
</style>
