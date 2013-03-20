/**
 * usemin grunt task
 */

exports.init = function(grunt) {

    var exports = {};

    /**
     * usemin and usemin:* are used to replace the blocks in HTML
     */
    exports.usemin = function(type, content, block, dest) {
        var indent = (block.split(grunt.util.linefeed)[0].match(/^\s*/) || [])[0];
        if (type === 'css') {
            return content.replace(block, indent + '<link rel="stylesheet" href="' + dest + '">');
        }
        if (type === 'js') {
            return content.replace(block, indent + '<script src="' + dest + '"></script>');
        }
        return false;
    };

    return exports;
};