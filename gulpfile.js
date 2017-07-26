var gulp = require('gulp');

var config = {
	staticCdn: 'https://s.gjcdn.net',
	injectVersion: 2,
	framework: 'vue',
	sections: ['auth', 'checkout', 'claim'],
	translations: 'site-translations',
	translationSections: {
		auth: ['auth/'],
		dash: [
			'app/components/forms/dashboard',
			'app/components/forms/site-analytics',
			'app/views/dashboard',
		],
		checkout: ['checkout/'],
		claim: ['claim/'],
	},
};

require('./src/lib/gj-lib-client/gulp/tasks/common.js')(config, __dirname);
// require( './tasks/client.js' )( config );
require('./tasks/app.js')(config);
require('./tasks/terms.js')(config);
require('./tasks/game-api-doc.js')(config);

gulp.task('pre', gulp.parallel('terms', 'game-api-doc:nav', 'game-api-doc:compile'));
