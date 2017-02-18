import * as Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./link-card.html';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { Clipboard } from '../../../../lib/gj-lib-client/components/clipboard/clipboard-service';
import { AppCard } from '../../../../lib/gj-lib-client/components/card/card';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	name: 'sites-link-card',
	components: {
		AppCard,
		AppJolticon,
	}
})
export class AppSitesLinkCard extends Vue
{
	@Prop( Object ) site: Site;

	copyLink()
	{
		Clipboard.copy( this.site.url );
	}
}
