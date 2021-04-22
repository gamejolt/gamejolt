import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import {
	FiresidePostEmbed,
	TYPE_SKETCHFAB,
	TYPE_YOUTUBE,
} from '../../../../../_common/fireside/post/embed/embed.model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { AppResponsiveDimensions } from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import AppSketchfabEmbed from '../../../../../_common/sketchfab/embed/embed.vue';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.windowHeight * 0.5}px` });

@Component({
	components: {
		AppVideoEmbed,
		AppScrollInview,
		AppResponsiveDimensions,
		AppSketchfabEmbed,
	},
})
export default class AppFiresidePostEmbed extends Vue {
	@Prop(propRequired(FiresidePostEmbed)) embed!: FiresidePostEmbed;
	@Prop(propOptional(Boolean, true)) hideOutview!: boolean;

	readonly InviewConfig = InviewConfig;
	readonly TYPE_YOUTUBE = TYPE_YOUTUBE;
	readonly TYPE_SKETCHFAB = TYPE_SKETCHFAB;

	isOpen = false;
	shouldAutoplay = true;
	isInview = true;

	get shouldShow() {
		return this.embed.type === TYPE_YOUTUBE || this.embed.type === TYPE_SKETCHFAB;
	}

	get thumbUrl() {
		switch (this.embed.type) {
			case TYPE_YOUTUBE: {
				const videoId = this.embed.extraData.videoId;
				return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
			}
			case TYPE_SKETCHFAB:
				return null;
		}
	}

	get title() {
		switch (this.embed.type) {
			case TYPE_YOUTUBE:
				return this.$gettext(`YouTube`);
			case TYPE_SKETCHFAB:
				return this.$gettext(`Sketchfab`);
		}
	}

	get website() {
		switch (this.embed.type) {
			case TYPE_YOUTUBE:
				return 'youtube.com';
			case TYPE_SKETCHFAB:
				return 'sketchfab.com';
		}
	}

	get shouldShowEmbedContent() {
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
