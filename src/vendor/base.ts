import '../lib/gj-lib-client/utils/polyfills';

import 'angular';
import 'angular-sanitize';
import 'angular-animate';
import 'angular-ui-router/lib/legacy/stateEvents.js';
import 'lodash';

// Pull into client.
// import '../bower-lib/dexie/dist/latest/Dexie.min';

import '../bower-lib/angular-loading-bar/build/loading-bar.min';
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
