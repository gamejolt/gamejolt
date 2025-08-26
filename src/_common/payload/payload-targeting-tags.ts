import { AdStore, setAdsTargetingTags } from '../ad/ad-store';

interface PayloadData {
	/** Targeting tags. */
	t?: string[];
}

export default function handlePayloadTargetingTags(
	{ adStore }: { adStore: AdStore },
	payload: PayloadData
) {
	if (!payload || !payload.t || !Array.isArray(payload.t) || !payload.t.length) {
		return;
	}

	setAdsTargetingTags(adStore, payload.t);
}
