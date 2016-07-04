/// <reference path="./typings/index.d.ts" />
/// <reference path="./node_modules/ng-metadata/manual_typings/globals.d.ts" />

interface Window {
	_: _.LoDashStatic;
	moment: moment.MomentStatic;
	_gjStartTime: number;
	Stripe: StripeStatic;
	gapi: any;
}

declare var global: any;

declare var GJ_ENVIRONMENT: 'development' | 'production';
declare var GJ_BUILD_TYPE: 'development' | 'production';

// Have to add this in for the moment.
declare module angular {
	interface IModule {
		controller(...args: ProvideSpreadType[]): IModule;
	}
}

// For lodash-es. Lame
declare module 'lodash-es/remove' { export default _.remove; }
declare module 'lodash-es/pull' { export default _.pull; }
declare module 'lodash-es/defaults' { export default _.defaults; }
declare module 'lodash-es/extend' { export default _.extend; }
declare module 'lodash-es/size' { export default _.size; }
declare module 'lodash-es/first' { export default _.first; }
declare module 'lodash-es/last' { export default _.last; }
declare module 'lodash-es/pick' { export default _.pick; }
declare module 'lodash-es/take' { export default _.take; }
declare module 'lodash-es/find' { export default _.find; }
declare module 'lodash-es/findLast' { export default _.findLast; }
declare module 'lodash-es/findIndex' { export default _.findIndex; }
declare module 'lodash-es/indexOf' { export default _.indexOf; }
declare module 'lodash-es/where' { export default _.where; }
declare module 'lodash-es/groupBy' { export default _.groupBy; }
declare module 'lodash-es/indexBy' { export default _.indexBy; }
declare module 'lodash-es/toArray' { export default _.toArray; }
declare module 'lodash-es/flatten' { export default _.flatten; }
declare module 'lodash-es/map' { export default _.map; }
declare module 'lodash-es/filter' { export default _.filter; }
declare module 'lodash-es/forEach' { export default _.forEach; }
declare module 'lodash-es/omit' { export default _.omit; }
declare module 'lodash-es/chunk' { export default _.chunk; }
declare module 'lodash-es/keys' { export default _.keys; }
declare module 'lodash-es/uniq' { export default _.uniq; }
declare module 'lodash-es/debounce' { export default _.debounce; }
declare module 'lodash-es/sum' { export default _.sum; }
declare module 'lodash-es/values' { export default _.values; }
