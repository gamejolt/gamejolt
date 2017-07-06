import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./key-group.html';
import { KeyGroup } from '../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({
	components: {
		AppExpand,
	},
	filters: {
		number,
	},
})
export class FormGameKeyGroup extends BaseForm<KeyGroup> implements FormOnInit {
	modelClass = KeyGroup;

	@Prop(Game) game: Game;
	@Prop(Array) packages: GamePackage[];

	number = number;
	KeyGroup = KeyGroup;
	GamePackage = GamePackage;

	onInit() {
		this.setField('game_id', this.game.id);
		// this.setField('packages', []);

		// if (this.method === 'edit') {
		// 	this.setField('packages', this.model!.packages.map(i => i.id));
		// }
	}

	get arePackagesChosen() {
		return this.formModel.packages.length > 0;
	}
}

// angular
// 	.module('App.Forms.Dashboard')
// 	.directive('gjFormDashboardGameKeyGroup', function(
// 		Form,
// 		KeyGroup,
// 		Game_Package
// 	) {
// 		var form = new Form({
// 			model: 'KeyGroup',
// 			template: require('./key-group.html'),
// 			resetOnSubmit: true,
// 		});

// 		form.scope.game = '=';
// 		form.scope.packages = '=';

// 		form.onInit = function(scope) {
// 			scope.KeyGroup = KeyGroup;
// 			scope.Game_Package = Game_Package;
// 			scope.formModel.game_id = scope.game.id;

// 			scope.formModel.packages = {};
// 			if (scope.method === 'add') {
// 			} else if (scope.method === 'edit') {
// 				angular.forEach(scope.baseModel.packages, function(_package) {
// 					scope.formModel.packages[_package.id] = true;
// 				});
// 			}

// 			scope.arePackagesChosen = function() {
// 				for (var i in scope.formModel.packages) {
// 					if (scope.formModel.packages[i]) {
// 						return true;
// 					}
// 				}
// 				return false;
// 			};
// 		};

// 		form.onSubmitSuccess = function(scope, response) {
// 			if (scope.game) {
// 				scope.game.assign(response.game);
// 			}
// 		};

// 		return form;
// 	});
