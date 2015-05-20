'use strict';

module.exports = function() {
	return {
		bold: function(message) { return '<bold>' + message + '</bold>'; },
		dim: function(message) { return '<dim>' + message + '</dim>'; },
		underline: function(message) { return '<underline>' + message + '</underline>'; },
		inverse: function(message) { return '<inverse>' + message + '</inverse>'; },
		hidden: function(message) { return '<hidden>' + message + '</hidden>'; },
		strikethrough: function(message) { return '<strikethrough>' + message + '</strikethrough>'; },
		black: function(message) { return '<black>' + message + '</black>'; },
		red: function(message) { return '<red>' + message + '</red>'; },
		green: function(message) { return '<green>' + message + '</green>'; },
		yellow: function(message) { return '<yellow>' + message + '</yellow>'; },
		blue: function(message) { return '<blue>' + message + '</blue>'; },
		magenta: function(message) { return '<magenta>' + message + '</magenta>'; },
		cyan: function(message) { return '<cyan>' + message + '</cyan>'; },
		white: function(message) { return '<white>' + message + '</white>'; },
		gray: function(message) { return '<gray>' + message + '</gray>'; },
		bgBlack: function(message) { return '<bg-black>' + message + '</bg-black>'; },
		bgRed: function(message) { return '<bg-red>' + message + '</bg-red>'; },
		bgGreen: function(message) { return '<bg-green>' + message + '</bg-green>'; },
		bgYellow: function(message) { return '<bg-yellow>' + message + '</bg-yellow>'; },
		bgBlue: function(message) { return '<bg-blue>' + message + '</bg-blue>'; },
		bgMagenta: function(message) { return '<bg-magenta>' + message + '</bg-magenta>'; },
		bgCyan: function(message) { return '<bg-cyan>' + message + '</bg-cyan>'; },
		bgWhite: function(message) { return '<bg-white>' + message + '</bg-white>'; },
		bgGray: function(message) { return '<bg-gray>' + message + '</bg-gray>'; }
	};
};
