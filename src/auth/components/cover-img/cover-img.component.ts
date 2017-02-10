import { Component, Input, OnChanges, SimpleChanges } from 'ng-metadata/core';
import * as template from '!html-loader!./cover-img.component.html';

import { ImgHelper } from '../../../lib/gj-lib-client/components/img/helper/helper-service';

@Component({
	selector: 'gj-cover-img',
	template,
})
export class CoverImgComponent implements OnChanges
{
	@Input() imgUrl: string;

	isLoaded = false;

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['imgUrl'] ) {
			this.isLoaded = false;
			ImgHelper.loaded( this.imgUrl ).then( () => this.isLoaded = true );
		}
	}
}
