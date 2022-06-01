import {
	TranslatableStringSubtype1,
	TranslatableStringSubtype2,
	TranslatableStringType,
} from './translatable-string/enums';

export class TranslatableString {
	type = TranslatableStringType.UNSET;
	subtype1 = TranslatableStringSubtype1.UNSET;
	subtype2 = TranslatableStringSubtype2.UNSET;
	viewer_version = 0;
	context: Record<string, string | number> = {};
	params: Record<string, string> = {};
	fallback_text = '';

	_resolved: string | null = null;

	get value() {
		return this._resolved ?? this.fallback_text;
	}
}

export async function createTranslatableStringFromPayload(
	payload: Record<string, any>
): Promise<TranslatableString> {
	const tstring = new TranslatableString();
	for (const k in payload) {
		console.log(k);
		if (Object.prototype.hasOwnProperty.call(tstring, k)) {
			console.log('setting');
			(tstring as any)[k] = payload[k];
		}
	}

	await resolveTranslationString(tstring);

	return tstring;
}

async function resolveTranslationString(tstring: TranslatableString): Promise<void> {
	switch (tstring.type) {
		case TranslatableStringType.FIRESIDE_POST_VIDEO:
			(await import('./translatable-string/fireside-post-video-tstring')).default(tstring);
			return;
	}
}
