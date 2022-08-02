<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppCommunityThumbnailImg from '../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { Screen } from '../../../_common/screen/screen-service';
import AppStickerStack from '../../../_common/sticker/stack/AppStickerStack.vue';
import { StickerTargetController } from '../../../_common/sticker/target/target-controller';
import AppTheme from '../../../_common/theme/AppTheme.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';

const props = defineProps({
	fireside: {
		type: Object as PropType<Fireside>,
		required: true,
	},
	stickerTargetController: {
		type: Object as PropType<StickerTargetController>,
		default: undefined,
	},
	overlay: {
		type: Boolean,
	},
});

const { fireside, stickerTargetController, overlay } = toRefs(props);
</script>

<template>
	<AppTheme class="fireside-header" :class="{ '-overlay': overlay }" :force-dark="overlay">
		<div class="-leading">
			<div class="-title-wrapper">
				<div class="-title" :title="fireside.title">
					{{ fireside.title }}
				</div>

				<span v-if="fireside.is_draft" class="-tag tag">
					<AppTranslate>Private</AppTranslate>
				</span>
				<span v-else class="-tag tag tag-highlight">
					<AppTranslate>Public</AppTranslate>
				</span>
			</div>

			<div class="-communities">
				<div v-if="fireside.community" class="-community">
					<div class="-community-avatar">
						<AppCommunityThumbnailImg :community="fireside.community" />
					</div>
					<RouterLink :to="fireside.community.routeLocation">
						{{ fireside.community.name }}
					</RouterLink>
				</div>
			</div>
		</div>

		<div v-if="!Screen.isXs && stickerTargetController">
			<AppStickerStack :controller="stickerTargetController" reverse use-fireside-sub />
		</div>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.fireside-header
	display: flex
	align-items: center

.-overlay
	fireside-overlay-text-shadow()
	color: white

.-leading
	flex: auto
	max-width: 100%

.-title-wrapper
	flex: auto
	display: flex
	align-items: center
	gap: 12px

.-title
	text-overflow()
	font-size: 24px
	font-weight: 800

.-tag
	flex: none
	text-shadow: none

.-communities
	display: flex
	gap: 8px

.-community
	display: flex
	align-items: center
	font-weight: 700

.-community-avatar
	width: 16px
	height: 16px
	margin-right: 4px
</style>
