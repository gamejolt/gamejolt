import View from '!view!./page-header.html?style=./page-header.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { AppAutoscrollAnchor } from '../../../lib/gj-lib-client/components/scroll/auto-scroll/anchor';
import { AppMediaItemCover } from '../../../_common/media-item/cover/cover';
import './page-header-content.styl';

@View
@Component({
	components: {
		AppAutoscrollAnchor,
		AppMediaItemCover,
	},
})
export class AppPageHeader extends Vue {
	@Prop(Object)
	coverMediaItem?: MediaItem;

	@Prop(Number)
	coverMaxHeight?: number;

	@Prop(Boolean)
	coverAutoHeight?: boolean;

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
