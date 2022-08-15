<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import AppEditableOverlay from '../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppMediaItemCover from '../../../_common/media-item/cover/cover.vue';
import { MediaItem } from '../../../_common/media-item/media-item-model';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import { AppAutoscrollAnchor } from '../../../_common/scroll/auto-scroll/anchor';
import './page-header-content.styl';

@Options({
	components: {
		AppAutoscrollAnchor,
		AppScrollAffix,
		AppMediaItemCover,
		AppEditableOverlay,
	},
})
export default class AppPageHeader extends Vue {
	@Prop(Object)
	coverMediaItem?: MediaItem;

	@Prop(Number)
	coverMaxHeight?: number;

	@Prop(Boolean)
	coverAutoHeight?: boolean;

	@Prop(Boolean)
	coverEditable?: boolean;

	@Prop(Boolean)
	hideNav?: boolean;

	@Prop(Boolean)
	shouldAffixNav?: boolean;

	@Prop(Boolean)
	spotlightDark?: boolean;

	@Prop(Boolean)
	blurHeader?: boolean;

	@Prop({ type: String, default: 'col-xs-12' })
	colClasses?: string;

	@Prop()
	autoscrollAnchorKey!: any;

	@Prop(Boolean)
	disableAutoscrollAnchor!: any;

	@Prop(Boolean)
	showCoverButtons?: boolean;

	readonly Screen = Screen;

	@Emit('edit-cover')
	emitEditCover() {}

	get hasSpotlight() {
		return !!this.$slots.spotlight && !Screen.isXs;
	}

	get hasNav() {
		return !!this.$slots.nav;
	}

	get hasControls() {
		return !!this.$slots.controls;
	}

	get hasContent() {
		return !!this.$slots.default;
	}
}
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
				@click="emitEditCover"
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

				<div
					v-if="hasSpotlight"
					class="page-header-spotlight"
					:class="{ dark: spotlightDark }"
				>
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
