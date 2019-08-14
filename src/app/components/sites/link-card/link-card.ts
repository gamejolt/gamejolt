import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppCard from '../../../../_common/card/card.vue';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import { Site } from '../../../../_common/site/site-model';

@Component({
	components: {
		AppCard,
	},
})
export default class AppSitesLinkCard extends Vue {
	@Prop(Object) site!: Site;

	copyLink() {
		Clipboard.copy(this.site.url);
	}
}
