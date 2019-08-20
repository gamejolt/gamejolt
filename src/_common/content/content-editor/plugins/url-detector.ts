import { extractUrlsWithIndices } from 'twitter-text';

type RegexResult = {
	index: number;
	match: string;
};

export class UrlDetector {
	public static detect(text: string, offset: number): RegexResult[] {
		const twturls = extractUrlsWithIndices(text, { extractUrlsWithoutProtocol: true });
		return twturls.map(function(i) {
			return {
				index: i.indices['0'] + offset,
				match: i.url,
			};
		});
	}
}
