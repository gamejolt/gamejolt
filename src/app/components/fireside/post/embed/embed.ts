import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import {
	FiresidePostEmbed,
	TYPE_SKETCHFAB,
	TYPE_YOUTUBE,
} from '../../../../../_common/fireside/post/embed/embed.model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { AppResponsiveDimensions } from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/inview.vue';
import AppSketchfabEmbed from '../../../../../_common/sketchfab/embed/embed.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height * 0.5}px` });

@Options({
	components: {
		AppVideoEmbed,
		AppScrollInview,
		AppResponsiveDimensions,
		AppSketchfabEmbed,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresidePostEmbed extends Vue {
	@Prop(propRequired(Object)) embed!: FiresidePostEmbed;
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
		if (this.embed.metadata && this.embed.metadata.image_media_item) {
			return this.embed.metadata.image_media_item.mediaserver_url;
		}

		switch (this.embed.type) {
			case TYPE_YOUTUBE: {
				const videoId = this.embed.extraData.videoId;
				return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
			}
		}

		return undefined;
	}

	get title() {
		if (this.embed.metadata && this.embed.metadata.title) {
			return this.embed.metadata.title;
		}

		switch (this.embed.type) {
			case TYPE_YOUTUBE:
				return this.$gettext(`YouTube`);
			case TYPE_SKETCHFAB:
				return this.$gettext(`Sketchfab`);
		}
	}

	get website() {
		if (this.embed.metadata && this.embed.metadata.site_url) {
			// Node SSR doesn't support the URL api.
			if (import.meta.env.SSR) {
				return this.embed.metadata.site_url;
			}

			const url = new URL(this.embed.metadata.site_url);
			let website = url.hostname;
			if (
				this.embed.metadata.site_name &&
				this.embed.metadata.site_name !== this.embed.metadata.url
			) {
				website = this.embed.metadata.site_name + ' | ' + website;
			}
			return website;
		}

		switch (this.embed.type) {
			case TYPE_YOUTUBE:
				return 'youtube.com';
			case TYPE_SKETCHFAB:
				return 'sketchfab.com';
		}
	}

	get description() {
		if (this.embed.metadata) {
			if (this.embed.metadata.description) {
				return this.embed.metadata.description.replace('\n', ' ');
			}

			if (this.embed.metadata.site_name) {
				return this.embed.metadata.site_name;
			}

			return this.embed.metadata.site_url;
		}

		return this.embed.url;
	}

	get shouldShowEmbedContent() {
		return this.isInview || !this.hideOutview;
	}

	get imageAlt() {
		if (this.embed.metadata && this.embed.metadata.image_alt) {
			return this.embed.metadata.image_alt;
		}
	}

	get playIcon() {
		switch (this.embed.type) {
			case TYPE_SKETCHFAB:
				return 'sketchfab';
			case TYPE_YOUTUBE:
				return 'play';
		}

		return 'blog-article';
	}

	onClick() {
		if (this.embed.is_processing) {
			return;
		}

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
