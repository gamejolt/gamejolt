import { Component } from 'vue-property-decorator';
import * as View from '!view!./thumbnail.html';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import {
	BaseForm,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';

@View
@Component({
	components: {
		AppFormControlUpload,
	},
})
export class FormGameThumbnail extends BaseForm<Game> implements FormOnLoad {
	modelClass = Game;
	resetOnSubmit = true;
	saveMethod = '$saveThumbnail' as '$saveThumbnail';
	maxFilesize = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;
	cropAspectRatio = 0;

	get loadUrl() {
		return `/web/dash/developer/games/thumbnail/save/${this.model!.id}`;
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
		this.minWidth = payload.minWidth;
		this.minHeight = payload.minHeight;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
		this.cropAspectRatio = payload.cropAspectRatio;
	}

	/**
	 * Old thumbnails were smaller than our current minimums.
	 * We don't want to allow to crop them, but we do want to allow them to upload a new one.
	 * We check here if it's too small to crop to signal to the form to remove the cropper.
	 */
	get canCrop() {
		const model = this.model!;

		if (!model.thumbnail_media_item) {
			return false;
		}

		if (
			model.thumbnail_media_item!.width < this.minWidth ||
			model.thumbnail_media_item.height < this.minHeight
		) {
			return false;
		}

		return true;
	}
}

// angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameThumbnail', function( Form, Api, gettext )
// {
// 	// Needed for the crop label.
// 	gettext( 'dash.games.thumbnail.crop_label' );
// 	gettext( 'dash.games.thumbnail.nocrop_label' );

// 	var form = new Form( {
// 		model: 'Game',
// 		template: require( './thumbnail.html' ),
// 		saveMethod: '$saveThumbnail',
// 		resetOnSubmit: true,
// 	} );

// 	form.onInit = function( scope )
// 	{
// 		scope.Loader = Loader;
// 		Loader.load( 'upload' );
// 		Loader.load( 'jcrop' );

// 		// Only set this once.
// 		// If the thumbnail changes outside of this form, we want to reinitialize it to pick up the changes.
// 		if ( !scope.isWatcherSet ) {
// 			scope.$watch( function()
// 			{
// 				return !!this.model!.thumbnail_media_item;
// 			},
// 			function( newVal, oldVal )
// 			{
// 				if ( newVal !== oldVal ) {
// 					form._init( scope );
// 				}
// 			} );
// 			scope.isWatcherSet = true;
// 		}

// 		if ( scope.formModel.thumbnail_media_item ) {
// 			scope.formModel.crop = scope.formModel.thumbnail_media_item.getCrop();
// 			form.checkCanCrop( scope );
// 		}
// 		else {
// 			scope.formModel.crop = undefined;
// 		}

// 		scope.formModel.file = undefined;
// 	};

// 	return form;
// } );
