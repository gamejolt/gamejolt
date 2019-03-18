import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import { Clipboard } from 'game-jolt-frontend-lib/components/clipboard/clipboard-service';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppCard,
		AppJolticon,
	},
})
export default class AppSitesLinkCard extends Vue {
	@Prop(Object) site!: Site;

	copyLink() {
		Clipboard.copy(this.site.url);
	}
}
