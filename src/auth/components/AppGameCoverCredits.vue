<script lang="ts" setup>
import { formatNumber } from '../../_common/filters/number';
import AppGameThumbnailImg from '../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import AppTranslate from '../../_common/translate/AppTranslate.vue';
import { useAuthStore } from '../store/index';

const { coverGame } = useAuthStore();
</script>

<template>
	<router-link
		v-if="coverGame"
		class="game-cover-credits link-unstyled"
		:to="coverGame.getUrl()"
		:title="coverGame.title"
		target="_blank"
	>
		<div class="-container">
			<div class="-col">
				<div class="-title">
					{{ coverGame.title }}
				</div>
				<div class="-dev text-muted">
					<AppTranslate>by</AppTranslate>
					{{ ' ' }}
					<strong>{{ coverGame.developer.display_name }}</strong>
				</div>
				<div class="-followers text-muted">
					<AppTranslate
						:translate-n="coverGame.follower_count || 0"
						:translate-params="{ count: formatNumber(coverGame.follower_count || 0) }"
						translate-plural="%{ count } followers"
					>
						%{ count } follower
					</AppTranslate>
				</div>
			</div>
			<div class="-img">
				<AppGameThumbnailImg :game="coverGame" />
			</div>
		</div>
	</router-link>
</template>

<style lang="stylus" scoped>
$-image-width = 120px
$-spacing = 8px
$-padding = 8px
$-width = 320px

.game-cover-credits
	rounded-corners()
	display: block
	padding: $-padding
	background-color: rgba($black, 0.4)

.-container
	display: flex
	max-width: $-width

a
	width: fit-content

a:hover
	border-bottom: none !important
	background-color: rgba($black, 0.8)

.-img
	width: $-image-width
	margin-left: $-spacing
	flex: none

.-title
	font-weight: 700

.-dev
	font-size: $font-size-small

.-followers
	font-size: $font-size-small

.-col
	display: flex
	flex-flow: column nowrap
	justify-content: space-between
	align-items: flex-end

	> *
		display: block
		text-overflow()
		max-width: $-width - ($-image-width + $-spacing)
</style>
