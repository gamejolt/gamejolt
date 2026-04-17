<script lang="ts" setup>
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppShareControl from '~common/share/AppShareControl.vue';
import { showShareModal } from '~common/share/card/_modal/modal.service';
import AppShareCardTile from '~common/share/card/AppShareCardTile.vue';
import { ShareProvider, ShareResource } from '~common/share/share.service';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	resource: ShareResource;
	url: string;
	hideHeading?: boolean;
	bleedPadding?: boolean;
	offsetColor?: boolean;
};
const { resource, url } = defineProps<Props>();

const providers: ShareProvider[] = ['facebook', 'twitter'];

function openShareModal() {
	showShareModal({
		resource: resource,
		url: url,
	});
}
</script>

<template>
	<div
		class="share-card card"
		:class="{ '-bleed-padding': bleedPadding, '-offset-color': offsetColor }"
	>
		<div class="-content">
			<h4 v-if="!hideHeading">
				<AppTranslate>Share</AppTranslate>
			</h4>

			<AppShareControl class="-content-row" :url="url" :resource="resource" />

			<div class="-content-row-lower">
				<AppShareCardTile
					v-for="i in providers"
					:key="i"
					:resource="resource"
					:url="url"
					:provider="i"
					dense
				/>

				<a class="-tile -dense" @click="openShareModal()">
					<AppJolticon class="-icon" icon="ellipsis-h" />
				</a>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import './common'
@import '../../card/card'

h4
	margin: $-base-padding
	margin-left: $-base-padding * 1.5
	color: var(--theme-fg)

.share-card
	background-color: var(--theme-bg)
	padding: 0
	overflow: hidden

	&.-offset-color
		background-color: var(--theme-bg-offset)

	&.-bleed-padding
		margin-left: -8px
		margin-right: -8px

.-content
	display: flex
	flex-direction: column
	overflow: hidden

.-content-row
.-content-row-lower
	display: inline-flex

.-content-row
	padding: $-base-padding
	grid-gap: $-base-padding

.-content-row-lower
	border-top: $-border

	> *
		&:not(&:last-of-type)
			border-right: $-border

.-url
	flex: auto
	height: $button-md-line-height
</style>
