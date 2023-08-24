<script lang="ts" setup>
import { PropType, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppCommunityThumbnailImg from '../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { FiresideModel } from '../../../_common/fireside/fireside.model';
import AppRealmThumbnail from '../../../_common/realm/AppRealmThumbnail.vue';
import { Screen } from '../../../_common/screen/screen-service';
import AppStickerStack from '../../../_common/sticker/stack/AppStickerStack.vue';
import { StickerTargetController } from '../../../_common/sticker/target/target-controller';
import AppTheme from '../../../_common/theme/AppTheme.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';

const props = defineProps({
	fireside: {
		type: Object as PropType<FiresideModel>,
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

				<!-- Only show this if our header is being shown as an overlay,
				otherwise we handle it elsewhere -->
				<template v-if="overlay">
					<span
						v-if="fireside.is_draft"
						class="-tag tag"
						style="background-color: var(--theme-bg)"
					>
						<AppTranslate>Private</AppTranslate>
					</span>
					<span v-else class="-tag tag tag-highlight">
						<AppTranslate>Public</AppTranslate>
					</span>
				</template>
			</div>

			<div class="-targetables">
				<div v-if="fireside.realm" class="-targetable">
					<div class="-realm-avatar">
						<AppRealmThumbnail :realm="fireside.realm" not-rounded />
					</div>
					<RouterLink :class="{ '-overlay': overlay }" :to="fireside.realm.routeLocation">
						{{ fireside.realm.name }}
					</RouterLink>
				</div>
				<div v-if="fireside.community" class="-targetable">
					<div class="-community-avatar">
						<AppCommunityThumbnailImg :community="fireside.community" />
					</div>
					<RouterLink
						:class="{ '-overlay': overlay }"
						:to="fireside.community.routeLocation"
					>
						{{ fireside.community.name }}
					</RouterLink>
				</div>
			</div>
		</div>

		<div v-if="!Screen.isXs && stickerTargetController" class="-reactions">
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
	min-width: 0

.-title-wrapper
	flex: auto
	display: flex
	align-items: center
	gap: 12px

.-title
	text-overflow()
	font-size: 27px
	font-family: $font-family-heading
	font-weight: 800

.-tag
	flex: none
	text-shadow: none

.-targetables
	display: flex
	gap: 8px

.-targetable
	display: flex
	align-items: center
	font-weight: 700

.-community-avatar
	width: 16px
	height: 16px
	margin-right: 4px

.-realm-avatar
	width: 12px
	height: 16px
	margin-right: 8px

.-reactions
	margin-left: 8px
</style>
