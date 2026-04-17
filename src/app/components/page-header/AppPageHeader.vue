<script lang="ts" setup>
import '~app/components/page-header/page-header-content.styl';

import { computed, CSSProperties, useSlots } from 'vue';

import AppEditableOverlay from '~common/editable-overlay/AppEditableOverlay.vue';
import AppMediaItemCover from '~common/media-item/cover/AppMediaItemCover.vue';
import { MediaItemModel } from '~common/media-item/media-item-model';
import { Screen } from '~common/screen/screen-service';
import AppScrollAffix from '~common/scroll/AppScrollAffix.vue';
import AppAutoscrollAnchor from '~common/scroll/auto-scroll/AppAutoscrollAnchor.vue';

interface PageHeaderSlots {
	spotlight?: boolean;
	nav?: boolean;
	controls?: boolean;
}

type Props = {
	coverMediaItem?: MediaItemModel;
	coverMaxHeight?: number;
	coverAutoHeight?: boolean;
	coverEditable?: boolean;
	hideNav?: boolean;
	shouldAffixNav?: boolean;
	blurHeader?: boolean;
	colClasses?: string;
	autoscrollAnchorKey?: string | number;
	disableAutoscrollAnchor?: boolean;
	showCoverButtons?: boolean;
	/**
	 * Used so we can override our `hasSlotName` computed properties, allowing
	 * them to be reactive.
	 */
	overrideSlots?: PageHeaderSlots;
	coverHeaderStyles?: CSSProperties;
};
const {
	coverMediaItem,
	coverMaxHeight,
	coverAutoHeight,
	coverEditable,
	hideNav,
	shouldAffixNav,
	blurHeader,
	colClasses = 'col-xs-12',
	autoscrollAnchorKey,
	disableAutoscrollAnchor,
	showCoverButtons,
	overrideSlots,
	coverHeaderStyles = {},
} = defineProps<Props>();

const emit = defineEmits<{
	'edit-cover': [];
}>();

const slots = useSlots();

const hasSpotlight = computed(() => {
	if (Screen.isXs) {
		return false;
	}
	const override = overrideSlots?.spotlight;
	if (override !== undefined) {
		return override;
	}
	return !!slots['spotlight'];
});

const hasNav = computed(() => {
	const override = overrideSlots?.nav;
	if (override !== undefined) {
		return override;
	}
	return !!slots['nav'];
});

const hasControls = computed(() => {
	const override = overrideSlots?.controls;
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
			:style="{ ...coverHeaderStyles }"
		>
			<AppEditableOverlay
				v-if="coverEditable"
				:class="{ '-cover-img': !!coverMediaItem }"
				:disabled="!coverEditable"
				@toggle="emit('edit-cover')"
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

			<div class="gj-container">
				<div v-if="$slots.default" class="row">
					<div :class="colClasses">
						<div class="page-header-content">
							<slot name="default" />
						</div>
					</div>
				</div>

				<div v-if="hasSpotlight" class="page-header-spotlight">
					<slot name="spotlight" />
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
					<div class="gj-container">
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

<style lang="stylus" src="~app/components/page-header/page-header.styl" scoped></style>
