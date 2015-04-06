# Skivvy API (TODO)

Skivvy can be used programatically, as follows:

```javascript
var skivvy = require('skivvy');

var build = require('./skivvy_tasks/build');

var config = {
	source: 'src',
	destination: 'dist'
};

skivvy.run(build, config, function(error) {
	if (error) {
		console.error('Build error: ' + error);
	} else {
		console.log('Build completed');
	}
});
```
