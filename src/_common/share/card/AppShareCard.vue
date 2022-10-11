<script lang="ts" setup>
import { PropType } from 'vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import AppShareControl from '../AppShareControl.vue';
import { ShareProvider, ShareResource } from '../share.service';
import AppShareCardTile from './AppShareCardTile.vue';
import { ShareModal } from './_modal/modal.service';

const props = defineProps({
	resource: {
		type: String as PropType<ShareResource>,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	hideHeading: {
		type: Boolean,
	},
	bleedPadding: {
		type: Boolean,
	},
	offsetColor: {
		type: Boolean,
	},
});

const providers: ShareProvider[] = ['facebook', 'twitter'];

function openShareModal() {
	ShareModal.show({
		resource: props.resource,
		url: props.url,
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
