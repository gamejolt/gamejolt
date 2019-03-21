import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppScrollAffix from 'game-jolt-frontend-lib/components/scroll/affix/affix.vue';
import { AppAutoscrollAnchor } from 'game-jolt-frontend-lib/components/scroll/auto-scroll/anchor';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppMediaItemCover from '../../../_common/media-item/cover/cover.vue';
import './page-header-content.styl';

@Component({
	components: {
		AppAutoscrollAnchor,
		AppScrollAffix,
		AppMediaItemCover,
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
