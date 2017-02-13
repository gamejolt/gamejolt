import 'core-js/es6/symbol';
import 'core-js/es6/object';
import 'core-js/es6/function';
import 'core-js/es6/parse-int';
import 'core-js/es6/parse-float';
import 'core-js/es6/number';
import 'core-js/es6/math';
import 'core-js/es6/string';
import 'core-js/es6/date';
import 'core-js/es6/array';
import 'core-js/es6/regexp';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/promise';

import 'core-js/modules/es7.object.values';

import 'reflect-metadata';

import 'angular';
import 'angular-sanitize';
import 'angular-animate';
import 'angular-ui-router/lib/legacy/stateEvents.js';
import 'lodash';

// Pull into client.
// import '../bower-lib/dexie/dist/latest/Dexie.min';

import '../bower-lib/angular-loading-bar/build/loading-bar.min';
import '../bower-lib/angular-scroll/angular-scroll.min';
import '../bower-lib/angular-gettext/dist/angular-gettext.min';
import '../bower-lib/angular-validation-match/dist/angular-input-match.min';

import '../bower-lib/angular-bootstrap/src/transition/transition';
import '../bower-lib/angular-bootstrap/src/position/position';
import '../bower-lib/angular-bootstrap/src/bindHtml/bindHtml';
import '../bower-lib/angular-bootstrap/src/tooltip/tooltip';
import '../bower-lib/angular-bootstrap/src/collapse/collapse';
import '../bower-lib/angular-bootstrap/src/modal/modal';

// Bootstrap templates.
import '!ng-cache-loader?module=ui.bootstrap.modal&prefix=template/modal/!../lib/gj-lib-client/components/modal/window.html';
import '!ng-cache-loader?module=ui.bootstrap.modal&prefix=template/modal/!../lib/gj-lib-client/components/modal/backdrop.html';

import '!ng-cache-loader?module=ui.bootstrap.tooltip.tpls&prefix=template/tooltip/!../lib/gj-lib-client/components/tooltip/tooltip-popup.html';
import '!ng-cache-loader?module=ui.bootstrap.tooltip.tpls&prefix=template/tooltip/!../lib/gj-lib-client/components/tooltip/tooltip-html-unsafe-popup.html';
