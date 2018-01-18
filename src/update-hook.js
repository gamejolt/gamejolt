var fs = require('fs');
var path = require('path');

function rename(from, to) {
	return new Promise(function(resolve, reject) {
		fs.rename(from, to, function(err) {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

module.exports.pre = function(version, packagePath) {
	if (process.platform !== 'win32') {
		return Promise.resolve(true);
	}

	return rename(packagePath, path.join(packagePath, '..', 'package-old2'))
		.then(function() {
			return new Promise(function(resolve) {
				setTimeout(resolve, 3000);
			});
		})
		.then(function() {
			fs.writeFileSync(packagePath, 'test');
			return new Promise(function(resolve) {
				setTimeout(resolve, 3000);
			});
		})
		.then(function() {
			return true;
		});
};

module.exports.post = function(version, packagePath) {
	return Promise.resolve();
};
