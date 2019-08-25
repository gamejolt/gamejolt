import { MetaContainer } from './meta-container';

type RobotsTag = 'noindex' | 'nofollow';
type RobotsTags = Partial<{ [field in RobotsTag]: boolean }>;

export class SeoMetaContainer extends MetaContainer {
	private robotsTags: RobotsTags = {};

	deindex() {
		this.robotsTags.noindex = true;
		this.robotsTags.nofollow = true;
		this._updateRobotsTag();
	}

	private _updateRobotsTag() {
		const tags = Object.keys(this.robotsTags).join(' ');
		if (tags) {
			this.set('robots', tags);
		}
	}
}
