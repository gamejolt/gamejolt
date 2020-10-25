import { RawLocation } from 'vue-router';
import { Translate } from '../../../../_common/translate/translate.service';

export type SimpleTerm = {
	term: string;
	icon: string;
	title: string;
	ctas: SimpleTermCTA[];
	description?: string;
};

type SimpleTermCTA = {
	text: string;
	icon?: string;
	goto: RawLocation;
	userRequired?: boolean;
};

export const SimpleTerms: SimpleTerm[] = [
	{
		term: 'games',
		icon: 'game',
		title: Translate.$gettext('Find great games'),
		description: Translate.$gettext('Find the hottest trending games on Game Jolt.'),
		ctas: [
			{
				text: Translate.$gettext('Browse all games'),
				goto: {
					name: 'discover.games.list._fetch',
					params: { section: '' },
				},
			},
			{
				text: Translate.$gettext('Your Game Library'),
				goto: {
					name: GJ_IS_CLIENT ? 'library.installed' : 'library.overview',
				},
				icon: 'books',
				userRequired: true,
			},
		],
	},
	{
		term: 'communities',
		icon: 'search',
		title: Translate.$gettext('Discover communities'),
		description: Translate.$gettext('Discover and join fun Communities on Game Jolt.'),
		ctas: [
			{
				text: Translate.$gettext('Browse Communities'),
				goto: {
					name: 'discover.communities',
				},
			},
		],
	},
];
