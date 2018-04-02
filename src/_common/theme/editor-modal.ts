import { Component } from 'vue-property-decorator';
import View from '!view!./editor-modal.html?style=./editor-modal.styl';

import { BaseModal } from '../../lib/gj-lib-client/components/modal/base';
import { Theme } from './theme.service';
import { ThemeModel } from './theme.model';
import { AppThemeCluster } from './cluster/cluster';
import { AppTooltip } from '../../lib/gj-lib-client/components/tooltip/tooltip';

@View
@Component({
	components: {
		AppThemeCluster,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppThemeEditorModal extends BaseModal {
	theme = Theme.theme;
	presets: { [k: string]: ThemeModel } = {
		'Game Jolt': new ThemeModel('#ccff00', '#2f7f6f', '#ff3fac'),
		Aquarium: new ThemeModel('#00ffd2', '#00555f', '#ff4080'),
		Autumn: new ThemeModel('#ffe400', '#4c6f67', '#ff642e'),
		Cedar: new ThemeModel('#ffd052', '#523533', '#00ff8a'),
		Diamondback: new ThemeModel('#f1ce71', '#4f4836', '#ff8400'),
		GlowPaint: new ThemeModel('#46ff76', '#512762', '#ff3b3b'),
		Hydraulic: new ThemeModel('#ff4200', '#363636', '#ff9000'),
		JelPens: new ThemeModel('#00ffc0', '#3e2d70', '#ff009c'),
		Larkspur: new ThemeModel('#ffba00', '#003cab', '#ff00a8'),
		Mainsail: new ThemeModel('#fff65f', '#5f8698', '#ff5337'),
		Meadow: new ThemeModel('#00ffa8', '#006960', '#ff7e00'),
		Mochi: new ThemeModel('#a3ff78', '#537c40', '#ff6acc'),
		Seaplane: new ThemeModel('#86a2d6', '#2d3447', '#ff5a00'),
		Shortcake: new ThemeModel('#cb8659', '#5b3821', '#ff4080'),
		Rose: new ThemeModel('#ff4cad', '#2e2f49', '#ff134b'),
		GarterSnake: new ThemeModel('#ff0054', '#283736', '#13ffa9'),
		ToxicVHS: new ThemeModel('#ff177f', '#253b20', '#8df000'),
		Snowcone: new ThemeModel('#fffd6f', '#ab2956', '#5dd9be'),
		Lupin: new ThemeModel('#e88bff', '#533768', '#ff237b'),
		Sherbet: new ThemeModel('#ffad56', '#942d4e', '#4bd67f'),
	};

	selectPreset(preset: ThemeModel) {
		Theme.theme.notice = preset.notice;
		Theme.theme.highlight = preset.highlight;
		Theme.theme.backlight = preset.backlight;
	}
}
