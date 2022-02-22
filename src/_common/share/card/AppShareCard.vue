<script lang="ts" setup>
import { PropType } from 'vue';
import { copyShareLink, ShareProvider, ShareResource } from '../share.service';
import { ShareModal } from './_modal/modal.service';
import AppShareCardTile from './AppShareCardTile.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import AppButton from '../../button/AppButton.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';

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

function copyLink() {
	copyShareLink(props.url, props.resource);
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

			<div class="-content-row">
				<!-- force update on input so that the URL re-applies and they can't edit -->
				<input class="-url form-control" :value="url" @input="$forceUpdate()" />

				<AppButton class="-copy" @click="copyLink()">
					<AppTranslate>Copy</AppTranslate>
				</AppButton>
			</div>

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
