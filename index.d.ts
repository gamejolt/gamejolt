/// <reference path="./typings/index.d.ts" />

interface Window {
	_: _.LoDashStatic;
	moment: moment.MomentStatic;
	_gjStartTime: number;
}

declare var global: any;

declare var GJ_ENVIRONMENT: 'development' | 'production';
declare var GJ_BUILD_TYPE: 'development' | 'production';
