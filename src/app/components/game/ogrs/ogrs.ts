import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./ogrs.html?style=./ogrs.styl';

import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameOgrsTag } from './tag';

@View
@Component({
	components: {
		AppGameOgrsTag,
	},
})
export class AppGameOgrs extends Vue {
	@Prop([Game])
	game: Game;
	@Prop([Boolean])
	hideDescriptors?: boolean;
	@Prop([Boolean])
	hideTag?: boolean;

	get descriptors() {
		if (!this.game || this.hideDescriptors) {
			return [];
		}

		const descriptors: string[] = [];

		if (this.game.tigrs_cartoon_violence) {
			let descriptor = '';
			if (this.game.tigrs_cartoon_violence === 1) {
				descriptor = 'Mild ';
			} else if (this.game.tigrs_cartoon_violence === 3) {
				descriptor = 'Intense ';
			}
			descriptors.push(descriptor + 'Cartoon Violence');
		}

		if (this.game.tigrs_fantasy_violence) {
			let descriptor = '';
			if (this.game.tigrs_fantasy_violence === 1) {
				descriptor = 'Mild ';
			} else if (this.game.tigrs_fantasy_violence === 3) {
				descriptor = 'Intense ';
			}
			descriptors.push(descriptor + 'Fantasy Violence');
		}

		if (this.game.tigrs_realistic_violence) {
			let descriptor = '';
			if (this.game.tigrs_realistic_violence === 1) {
				descriptor = 'Mild ';
			} else if (this.game.tigrs_realistic_violence === 3) {
				descriptor = 'Intense ';
			}
			descriptors.push(descriptor + 'Realistic Violence');
		}

		if (this.game.tigrs_bloodshed) {
			if (this.game.tigrs_bloodshed === 1) {
				descriptors.push('Animated Bloodshed');
			} else if (this.game.tigrs_bloodshed === 2) {
				descriptors.push('Realistic Bloodshed');
			} else if (this.game.tigrs_bloodshed === 3) {
				descriptors.push('Blood and Gore');
			}
		}

		if (this.game.tigrs_sexual_violence === 1) {
			descriptors.push('Sexual Violence');
		}

		if (this.game.tigrs_alcohol) {
			if (this.game.tigrs_alcohol === 1) {
				descriptors.push('Alcohol Reference');
			} else if (this.game.tigrs_alcohol === 2) {
				descriptors.push('Alcohol Use');
			}
		}

		if (this.game.tigrs_drugs) {
			if (this.game.tigrs_drugs === 1) {
				descriptors.push('Drug Reference');
			} else if (this.game.tigrs_drugs === 2) {
				descriptors.push('Drug Use');
			}
		}

		if (this.game.tigrs_tobacco) {
			if (this.game.tigrs_tobacco === 1) {
				descriptors.push('Tobacco Reference');
			} else if (this.game.tigrs_tobacco === 2) {
				descriptors.push('Tobacco Use');
			}
		}

		if (this.game.tigrs_nudity) {
			if (this.game.tigrs_nudity === 1) {
				descriptors.push('Brief Nudity');
			} else if (this.game.tigrs_nudity === 2) {
				descriptors.push('Nudity');
			}
		}

		if (this.game.tigrs_sexual_themes) {
			if (this.game.tigrs_sexual_themes === 1) {
				descriptors.push('Suggestive Themes');
			} else if (this.game.tigrs_sexual_themes === 2) {
				descriptors.push('Sexual Themes');
			} else if (this.game.tigrs_sexual_themes === 3) {
				descriptors.push('Graphic Sexual Themes');
			}
		}

		if (this.game.tigrs_language) {
			let descriptor = '';
			if (this.game.tigrs_language === 1) {
				descriptor = 'Mild ';
			} else if (this.game.tigrs_language === 3) {
				descriptor = 'Strong ';
			}
			descriptors.push(descriptor + 'Language');
		}

		if (this.game.tigrs_humor) {
			if (this.game.tigrs_humor === 1) {
				descriptors.push('Comical Shenanigans');
			} else if (this.game.tigrs_humor === 2) {
				descriptors.push('Crass Humor');
			} else if (this.game.tigrs_humor === 3) {
				descriptors.push('Mature Humor');
			}
		}

		if (this.game.tigrs_gambling) {
			let descriptor = '';
			if (this.game.tigrs_gambling === 1) {
				descriptor = 'Simulated ';
			} else if (this.game.tigrs_gambling === 3) {
				descriptor = 'Real ';
			}
			descriptors.push(descriptor + 'Gambling');
		}

		return descriptors;
	}
}
