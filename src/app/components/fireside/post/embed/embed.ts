import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { FiresidePostEmbed } from '../../../../../_common/fireside/post/embed/embed.model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { AppResponsiveDimensions } from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.windowHeight * 0.5}px` });

@Component({
	components: {
		AppVideoEmbed,
		AppScrollInview,
		AppResponsiveDimensions,
	},
})
export default class AppFiresidePostEmbed extends Vue {
	@Prop(propRequired(FiresidePostEmbed)) embed!: FiresidePostEmbed;
	@Prop(propOptional(Boolean, true)) hideOutview!: boolean;

	readonly InviewConfig = InviewConfig;
	isOpen = false;
	shouldAutoplay = true;
	isInview = true;

	get videoThumbUrl() {
		return `https://i.ytimg.com/vi/${this.embed.video_id}/hqdefault.jpg`;
	}

	get shouldShowVideo() {
		return this.isInview || !this.hideOutview;
	}

	onClick() {
		if (!this.isOpen) {
			this.isOpen = true;
		} else {
			Navigate.newWindow(this.embed.url);
		}
	}

	onInviewChanged(isInview: boolean) {
		this.isInview = isInview;

		// Disable autoplay when it was already opened
		if (!isInview && this.isOpen) {
			this.shouldAutoplay = false;
		}
	}
}
