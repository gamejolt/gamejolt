<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { useAppStore } from '../../../../store';

@Options({
	components: {
		AppCommunityThumbnailImg,
		AppMediaItemBackdrop,
	},
})
export default class AppCommunitySliderItem extends Vue {
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: String, required: false, default: 'global' }) eventCat!: string;

	store = setup(() => useAppStore());

	get communityStates() {
		return this.store.communityStates;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get isUnread() {
		return this.communityState.isUnread;
	}

	get gradient() {
		let begin = 'var(--theme-bi-bg)';
		let end = 'var(--theme-bi-fg)';

		if (this.community.theme) {
			begin = '#' + this.community.theme.biBg_;
			end = '#' + this.community.theme.biFg_;
		}

		return `linear-gradient(to bottom left, ${begin} 0, ${end} 100%)`;
	}

	get event() {
		return `${this.eventCat}:community-slider:${this.community.path}`;
	}
}
</script>

<template>
	<router-link
		v-app-track-event="event"
		class="-item"
		:class="{
			'-unread': isUnread,
		}"
		:to="{
			name: 'communities.view.overview',
			params: { path: community.path },
		}"
		:title="community.name"
	>
		<div
			class="-bubble"
			:style="{
				'background-image': isUnread ? gradient : undefined,
			}"
		>
			<AppMediaItemBackdrop class="-backdrop" :media-item="community.thumbnail" radius="full">
				<AppCommunityThumbnailImg class="-thumb" :community="community" />
			</AppMediaItemBackdrop>
		</div>

		<div class="-label">
			{{ community.name }}
		</div>
	</router-link>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
