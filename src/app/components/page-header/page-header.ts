import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppEditableOverlay from '../../../_common/editable-overlay/editable-overlay.vue';
import AppMediaItemCover from '../../../_common/media-item/cover/cover.vue';
import { MediaItem } from '../../../_common/media-item/media-item-model';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/affix/affix.vue';
import { AppAutoscrollAnchor } from '../../../_common/scroll/auto-scroll/anchor';
import './page-header-content.styl';

@Component({
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
		return !!this.$slots['spotlight'] && !Screen.isXs;
	}

	get hasNav() {
		return !!this.$slots['nav'];
	}

	get hasControls() {
		return !!this.$slots['controls'];
	}

	get hasContent() {
		return !!this.$slots.default;
	}
}
