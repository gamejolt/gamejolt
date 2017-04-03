import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./page-header.html?style=./page-header.styl';
import './page-header-content.styl';

import { AppScrollAffix } from '../../../lib/gj-lib-client/components/scroll/affix/affix';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';
import { makeObservableService } from '../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { AppMediaItemCover } from '../media-item/cover/cover';

@View
@Component({
	components: {
		AppScrollAffix,
		AppMediaItemCover,
	}
})
export class AppPageHeader extends Vue
{
	@Prop( Object ) coverMediaItem?: MediaItem;
	@Prop( Number ) coverMaxHeight?: number;
	@Prop( Boolean ) hideNav?: boolean;
	@Prop( Boolean ) shouldAffixNav?: boolean;
	@Prop( Boolean ) spotlightDark?: boolean;
	@Prop( { type: String, default: 'col-xs-12' } ) colClasses?: string;

	Screen = makeObservableService( Screen );

	get hasCoverButtons()
	{
		return !!this.$slots['cover-buttons'];
	}

	get hasSpotlight()
	{
		return !!this.$slots['spotlight'];
	}

	get hasNav()
	{
		return !!this.$slots['nav'];
	}

	get hasControls()
	{
		return !!this.$slots['controls'];
	}

	get hasContent()
	{
		return !!this.$slots.default;
	}
}
