import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { FiresidePostEmbed } from '../../../../../_common/fireside/post/embed/embed.model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';

@Component({
	components: {
		AppVideoEmbed,
	},
})
export default class AppFiresidePostEmbed extends Vue {
	@Prop(propRequired(FiresidePostEmbed)) embed!: FiresidePostEmbed;

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
}
