import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { SuggestionData } from '../../../../components/search/payload-service';
import AppTagThumbnail from '../../../../components/tag/thumbnail/thumbnail.vue';
import { UserTokenModal } from '../../../../components/user/token-modal/token-modal.service';
import { SimpleTerm, SimpleTerms } from '../simple-terms';

enum SuggestionType {
	GAME_CHANNEL = 'game-channel',
	GAME_API = 'game-api',
	SIMPLE_TERM = 'simple-term',
}

@Component({
	components: {
		AppTagThumbnail,
	},
})
export default class AppSearchSuggestionItem extends Vue {
	@Prop(propRequired()) data!: SuggestionData;

	readonly SuggestionType = SuggestionType;

	get suggestionType() {
		return this.data.type;
	}

	get suggestedGameChannel(): string {
		return this.data.data.channel;
	}

	get suggestedSimpleTerm(): SimpleTerm | null {
		const termName = this.data.data.term;
		const term = SimpleTerms.find(t => t.term === termName);
		if (!term) {
			return null;
		}
		return term;
	}

	showApiToken() {
		UserTokenModal.show();
	}
}
