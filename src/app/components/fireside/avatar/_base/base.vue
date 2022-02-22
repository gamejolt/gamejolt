<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';

@Options({
	components: {
		AppMediaItemBackdrop,
		AppCommunityThumbnailImg,
	},
})
export default class AppFiresideAvatarBase extends Vue {
	@Prop({ type: Boolean })
	isPlaceholder!: boolean;

	@Prop({ type: Boolean })
	isLive!: boolean;

	@Prop({ type: Object, default: null })
	avatarMediaItem!: MediaItem | null;

	@Prop({ type: Object, default: null })
	community!: Community | null;

	@Prop({ type: String, default: null })
	borderStyle!: 'dashed' | null;

	get hasTag() {
		if (this.isPlaceholder) {
			return true;
		}
		return !!this.$slots.tag;
	}

	get hasTitle() {
		if (this.isPlaceholder) {
			return true;
		}
		return !!this.$slots.title;
	}

	get hasLink() {
		if (this.isPlaceholder) {
			return false;
		}
		return !!this.$slots.link;
	}
}
</script>

<template>
	<div class="fireside-avatar" :class="{ '-placeholder': isPlaceholder }">
		<div class="-header">
			<div class="-avatar">
				<div class="-avatar-inner">
					<AppMediaItemBackdrop
						class="-avatar-img"
						:class="{ '-dashed': borderStyle === 'dashed' }"
						:media-item="avatarMediaItem"
					>
						<slot v-if="!isPlaceholder" name="avatar" />
					</AppMediaItemBackdrop>

					<slot v-if="!isPlaceholder" name="extras" />
				</div>
			</div>

			<div v-if="community" class="-community">
				<AppCommunityThumbnailImg
					v-if="!isPlaceholder"
					class="-community-img"
					:community="community"
				/>
			</div>

			<div v-if="hasTag" class="-tag" :class="{ '-live': isLive }">
				<slot v-if="!isPlaceholder" name="tag" />
				<AppTranslate v-else>CHAT</AppTranslate>
			</div>
		</div>

		<div v-if="hasTitle" class="-title">
			<slot v-if="!isPlaceholder" name="title" />
		</div>

		<div v-if="hasLink" class="-base-link">
			<slot v-if="!isPlaceholder" name="link" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'

.fireside-avatar
	&:not(.-placeholder)
		pressy()

.-subtle
	background-color: var(--theme-bg-subtle)
	border-color: var(--theme-bg-subtle)

.-dashed
	border-style: dashed
	border-color: var(--theme-fg-muted)

.-base-link
	::v-deep(> *)
		@extend .-link

.-placeholder
	.-tag
		elevate-0()

		> *
			visibility: hidden

	.-title
		lazy-placeholder-block()
		width: 60%

	.-avatar-img
	.-community
	.-tag
		@extend .-subtle
</style>
