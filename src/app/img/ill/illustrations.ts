// import illChargeOrbEmptyPath from './charge-orb-empty.png';
import illChargeOrbHalloweenEmptyPath from './charge-orb-halloween-empty.png';
import illCreatorInfographicPath from './creator-infographic.png';
import illEndOfFeedPath from './end-of-feed.png';
import illMaintenancePath from './maintenance.png';
import illMobileKikkersteinPath from './mobile-kikkerstein.png';
import illNoChatPath from './no-chat.png';
import illNoCommentsSmallPath from './no-comments-small.png';
import illNoCommentsPath from './no-comments.png';
import illPointyThingPath from './pointy-thing.png';
import illStreamingJellyPath from './streaming-jelly.png';
import illTimeOutPath from './time-out.png';

/**
 * Run all the assets through https://squoosh.app/
 *
 * Choose OxiPNG and to reduce the color palette. We can do that since we have
 * limited colors and it doesn't degrade the images.
 */

export interface IllustrationAsset {
	path: string;
	width: number;
	height: number;
}

export const illStreamingJelly: IllustrationAsset = {
	path: illStreamingJellyPath,
	width: 361,
	height: 250,
};

export const illTimeOut: IllustrationAsset = {
	path: illTimeOutPath,
	width: 308,
	height: 365,
};

export const illNoComments: IllustrationAsset = {
	path: illNoCommentsPath,
	width: 298,
	height: 366,
};

export const illNoCommentsSmall: IllustrationAsset = {
	path: illNoCommentsSmallPath,
	width: 277,
	height: 166,
};

export const illEndOfFeed: IllustrationAsset = {
	path: illEndOfFeedPath,
	width: 593,
	height: 239,
};

export const illMaintenance: IllustrationAsset = {
	path: illMaintenancePath,
	width: 385,
	height: 360,
};

export const illMobileKikkerstein: IllustrationAsset = {
	path: illMobileKikkersteinPath,
	width: 333,
	height: 363,
};

export const illNoChat: IllustrationAsset = {
	path: illNoChatPath,
	width: 584,
	height: 362,
};

export const illChargeOrbEmpty: IllustrationAsset = {
	path: illChargeOrbHalloweenEmptyPath, // illChargeOrbEmptyPath
	width: 500,
	height: 500,
};

export const illCreatorInfographic: IllustrationAsset = {
	path: illCreatorInfographicPath,
	width: 1600,
	height: 1000,
};

export const illPointyThing: IllustrationAsset = {
	path: illPointyThingPath,
	width: 383,
	height: 278,
};
