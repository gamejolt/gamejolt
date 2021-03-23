import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { FiresidePostEmbed } from '../../../../../_common/fireside/post/embed/embed.model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.windowHeight * 0.5}px` });

@Component({
	components: {
		AppVideoEmbed,
		AppScrollInview,
	},
})
export default class AppFiresidePostEmbed extends Vue {
	@Prop(propRequired(FiresidePostEmbed)) embed!: FiresidePostEmbed;

	readonly InviewConfig = InviewConfig;
	isOpen = false;

	get videoThumbUrl() {
		return `https://i.ytimg.com/vi/${this.embed.video_id}/maxresdefault.jpg`;
	}

	onClick() {
		if (!this.isOpen) {
			this.isOpen = true;
		} else {
			Navigate.newWindow(this.embed.url);
		}
	}

	onOutview() {
		this.isOpen = false;
	}
}
