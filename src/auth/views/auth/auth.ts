import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State} from 'vuex-class';
import * as View from '!view!./auth.html?style=./auth.styl';
import './auth-content.styl';

import { store, Actions } from '../../store/index';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';
import { AppCoverImg } from '../../components/cover-img/cover-img';
import { makeObservableService } from '../../../lib/gj-lib-client/utils/vue';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Connection } from '../../../lib/gj-lib-client/components/connection/connection-service';
import { AppTranslateLangSelector } from '../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';

@View
@Component({
	components: {
		AppCoverImg,
		AppTranslateLangSelector,
	},
	async beforeRouteEnter( _to, _from, next )
	{
		await store.dispatch( Actions.bootstrap );
		next();
	},
})
export default class RouteAuth extends Vue
{
	@State shouldShowCoverImage: boolean;
	@State coverMediaItem?: MediaItem;

	Environment = makeObservableService( Environment );
	Connection = makeObservableService( Connection );
}
