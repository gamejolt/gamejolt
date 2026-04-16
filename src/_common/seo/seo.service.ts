import { Meta } from '~common/meta/meta-service';

export type PayloadDirectives = {
	deindex?: boolean;
};

export class Seo {
	static processPayloadDirectives(data: PayloadDirectives) {
		if (data.deindex) {
			Meta.seo.deindex();
		}
	}
}
