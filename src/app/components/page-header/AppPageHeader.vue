<script lang="ts" setup>
import { computed, PropType, toRefs, useSlots } from 'vue';
import { ComponentProps } from '../../../_common/component-helpers';
import AppEditableOverlay from '../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppMediaItemCover from '../../../_common/media-item/cover/AppMediaItemCover.vue';
import { MediaItem } from '../../../_common/media-item/media-item-model';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import { AppAutoscrollAnchor } from '../../../_common/scroll/auto-scroll/anchor';
import './page-header-content.styl';

interface PageHeaderSlots {
	spotlight?: boolean;
	nav?: boolean;
	controls?: boolean;
}

const props = defineProps({
	coverMediaItem: {
		type: Object as PropType<MediaItem>,
		default: undefined,
	},
	coverMaxHeight: {
		type: Number,
		default: undefined,
	},
	coverAutoHeight: {
		type: Boolean,
	},
	coverEditable: {
		type: Boolean,
	},
	hideNav: {
		type: Boolean,
	},
	shouldAffixNav: {
		type: Boolean,
	},
	spotlightDark: {
		type: Boolean,
	},
	blurHeader: {
		type: Boolean,
	},
	colClasses: {
		type: String,
		default: 'col-xs-12',
	},
	autoscrollAnchorKey: {
		type: [String, Number] as PropType<string | number>,
		default: undefined,
	},
	disableAutoscrollAnchor: {
		type: Boolean,
	},
	showCoverButtons: {
		type: Boolean,
	},
	spotlightWrapper: {
		type: [Object, String] as PropType<any>,
		default: 'div',
	},
	spotlightWrapperProps: {
		type: Object as PropType<ComponentProps<any>>,
		default: undefined,
	},
	/**
	 * Used so we can override our `hasSlotName` computed properties, allowing
	 * them to be reactive.
	 */
	overrideSlots: {
		type: Object as PropType<PageHeaderSlots>,
		default: undefined,
	},
});

const {
	coverMediaItem,
	coverMaxHeight,
	coverAutoHeight,
	coverEditable,
	hideNav,
	shouldAffixNav,
	spotlightDark,
	blurHeader,
	colClasses,
	autoscrollAnchorKey,
	disableAutoscrollAnchor,
	showCoverButtons,
	spotlightWrapper,
	spotlightWrapperProps,
	overrideSlots,
} = toRefs(props);

const emit = defineEmits({
	'edit-cover': () => true,
});

const slots = useSlots();

const hasSpotlight = computed(() => {
	if (Screen.isXs) {
		return false;
	}
	const override = overrideSlots?.value?.spotlight;
	if (override !== undefined) {
		return override;
	}
	return !!slots['spotlight'];
});
const hasNav = computed(() => {
	const override = overrideSlots?.value?.nav;
	if (override !== undefined) {
		return override;
	}
	return !!slots['nav'];
});
const hasControls = computed(() => {
	const override = overrideSlots?.value?.controls;
	if (override !== undefined) {
		return override;
	}
	return !!slots['controls'];
});
</script>

<template>
	<header
		class="section page-header"
		:class="{
			'has-controls': hasControls,
			'has-spotlight': hasSpotlight,
			'has-nav': hasNav && !hideNav,
			'-cover-auto-height': coverAutoHeight,
		}"
	>
		<section
			class="section page-header-cover fill-darker"
			:class="{
				'has-cover-image': !!coverMediaItem,
				'has-cover-buttons': showCoverButtons,
				'is-editable': coverEditable,
			}"
		>
			<AppEditableOverlay
				v-if="coverEditable"
				:class="{ '-cover-img': !!coverMediaItem }"
				:disabled="!coverEditable"
				@click="emit('edit-cover')"
			>
				<template #overlay>
					<span>
						<slot name="cover-edit-buttons" />
					</span>
				</template>

				<!--
					If no cover media, reserve space with a min-height.
				-->
				<div
					class="fill-gray"
					:style="{
						'min-height': !coverMediaItem ? '200px' : '',
					}"
				>
					<AppMediaItemCover
						v-if="!!coverMediaItem"
						:media-item="coverMediaItem"
						:max-height="coverMaxHeight"
						:blur="blurHeader"
					/>
				</div>
			</AppEditableOverlay>
			<div v-else-if="!!coverMediaItem" class="-cover-img">
				<AppMediaItemCover
					:media-item="coverMediaItem"
					:max-height="coverMaxHeight"
					:blur="blurHeader"
				/>
			</div>

			<div v-if="showCoverButtons" class="page-header-cover-buttons">
				<div class="page-header-cover-buttons-inner">
					<svg class="page-header-cover-buttons-edge -left" viewBox="0 0 10 10">
						<path
							d="
								M0,0
								L10,0
								L10,10
								C5,10 5,0 0,0
								z
							"
						/>
					</svg>
					<svg class="page-header-cover-buttons-edge -right" viewBox="0 0 10 10">
						<path
							d="
								M10,0
								L0,0
								L0,10
								C5,10 5,0 10,0
								z
							"
						/>
					</svg>

					<slot name="cover-buttons" />
				</div>
			</div>

			<div class="container">
				<div class="row">
					<div :class="colClasses">
						<div class="page-header-content">
							<slot />
						</div>
					</div>
				</div>

				<div v-if="hasSpotlight" class="page-header-spotlight">
					<component
						:is="spotlightWrapper"
						:style="{
							width: `100%`,
							height: `100%`,
						}"
						v-bind="spotlightWrapperProps"
					>
						<div
							class="page-header-spotlight-bubble"
							:style="{
								zIndex: 2,
							}"
							:class="{ dark: spotlightDark }"
						>
							<div
								:style="{
									zIndex: 0,
								}"
							>
								<slot name="spotlight" />
							</div>
						</div>
					</component>
				</div>
			</div>
		</section>

		<AppAutoscrollAnchor
			v-if="hasNav && !hideNav"
			:anchor-key="autoscrollAnchorKey"
			:disabled="disableAutoscrollAnchor"
		>
			<AppScrollAffix
				:disabled="!(shouldAffixNav && Screen.isLg && Screen.height > 750)"
				:padding="0"
			>
				<section class="section page-header-nav">
					<div class="container">
						<div class="row">
							<div :class="colClasses">
								<div class="-index row">
									<div v-if="hasControls" class="-controls">
										<div class="page-header-controls">
											<slot name="controls" />
										</div>
									</div>
									<div
										class="-nav"
										:class="{
											'col-xs-12': !hasControls,
										}"
									>
										<slot name="nav" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</AppScrollAffix>
		</AppAutoscrollAnchor>
	</header>
</template>

<style lang="stylus" src="./page-header.styl" scoped></style>
