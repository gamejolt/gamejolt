import { Options, Prop } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GameSong } from '../../../../../_common/game/song/song.model';

@Options({
	components: {
		AppFormControlUpload,
	},
})
export default class FormGameSong extends BaseForm<GameSong> implements FormOnLoad {
	@Prop(Game) game!: Game;

	modelClass = GameSong;

	maxFilesize = 0;

	readonly formatNumber = formatNumber;

	get loadUrl() {
		return `/web/dash/developer/games/music/save/${this.game.id}`;
	}

	get fileLabel() {
		if (this.method === 'add') {
			return this.$gettext('dash.games.music.form.add_file_label');
		} else {
			return this.$gettext('dash.games.music.form.change_file_label');
		}
	}

	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		this.setField('game_id', this.game.id);
	}

	onLoad(payload: any) {
		this.maxFilesize = payload.maxFilesize;
	}
}

// angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameSong', function( Form, Api, gettextCatalog )
// {
// 	var form = new Form( {
// 		model: 'Game_Song',
// 		template: require( './song.html' ),
// 	} );

// 	form.scope.game = '=gjGame';

// 	form.onInit = function( scope )
// 	{
// 		scope.Loader = Loader;
// 		Loader.load( 'upload' );

// 		scope.formModel.game_id = scope.game.id;

// 		if ( !scope.isLoaded ) {
// 			Api.sendRequest( '/web/dash/developer/games/music/save/' + scope.formModel.game_id ).then( function( payload )
// 			{
// 				scope.isLoaded = true;
// 				angular.extend( scope, payload );
// 			} );
// 		}

// 		scope.getFileLabel = function()
// 		{
// 			if ( scope.method === 'add' ) {
// 				return gettextCatalog.getString( 'dash.games.music.form.add_file_label' );
// 			}
// 			else {
// 				return gettextCatalog.getString( 'dash.games.music.form.change_file_label' );
// 			}
// 		};
// 	};

// 	return form;
// } );
