const KebabCaseRegex = /[A-Z]/g;

/**
 * @__NO_SIDE_EFFECTS__
 */
export function kebabCase(name: string) {
	return name.replace(KebabCaseRegex, (letter, pos) => (pos ? '-' : '') + letter.toLowerCase());
}

export type TitleCaseOptions = Partial<{
	dropHyphens: boolean;
	dropUnderscores: boolean;
	expandCamelCase: boolean;
	keepLcWords: boolean;
}>;

// Common articles, coordinating conjunctions and prepositions that should normally be lowercased in titles.
const lcWords = [
	'A',
	'An',
	'The',
	'And',
	'But',
	'For',
	'Nor',
	'Or',
	'So',
	'Yet',
	'As',
	'At',
	'But',
	'By',
	'Etc',
	'For',
	'From',
	'In',
	'Into',
	'Of',
	'On',
	'Onto',
	'Than',
	'To',
	'Upon',
	'Via',
	'With',
];

/**
 * @__NO_SIDE_EFFECTS__
 */
export function titleCase(str: string, options?: TitleCaseOptions) {
	options = options || {};

	if (options.dropHyphens) {
		str = str.replace('-', ' ');
	}

	if (options.dropUnderscores) {
		str = str.replace('_', ' ');
	}

	if (options.expandCamelCase) {
		str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
	}

	// Uppercase words.
	return str.replace(/\w\S*/g, txt => {
		// Only bother titlecasing words that are fully lowercased.
		// This helps preserve acronyms and the likes.
		if (txt.toLowerCase() !== txt) {
			return txt;
		}

		let word = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		if (!options!.keepLcWords && lcWords.indexOf(word) !== -1) {
			word = word.toLowerCase();
		}
		return word;
	});
}

/**
 * Pulled from: https://github.com/bevacqua/fuzzysearch
 *
 * @__NO_SIDE_EFFECTS__
 */
export function fuzzysearch(query: string, text: string) {
	const tlen = text.length;
	const qlen = query.length;
	if (qlen > tlen) {
		return false;
	}
	if (qlen === tlen && query === text) {
		return true;
	}
	outer: for (let i = 0, j = 0; i < qlen; i++) {
		const qch = query.charCodeAt(i);
		while (j < tlen) {
			if (text.charCodeAt(j++) === qch) {
				continue outer;
			}
		}
		return false;
	}
	return true;
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function escapeRegex(str: string) {
	return str.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}
