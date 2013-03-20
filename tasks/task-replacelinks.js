/**
 * grunt task based on https://gist.github.com/3024891 from yeoman/node build processes
 */

module.exports = function(grunt) {
    var fs = require('fs');
    var path = require('path');
    var linefeed = grunt.util.linefeed;
    var usemin = require('./task-usemin').init(grunt).usemin;

    /**
     * Register the 'replacelinks' task
     *
     * This task accepts files and steps through them to find a comment pattern
     * that wraps a set of 'script' or 'link' elements. It replaces those
     * elements within an indivudal comment block with a single element
     * referencing a file into which they are all concatenated.
     */
    grunt.registerMultiTask('replacelinks', 'Replaces scripts / stylesheets in special HTML comment blocks', function() {
        var name = this.target;
        var data = this.data;
        var files = grunt.file.expand(data);

        files.map(grunt.file.read).forEach(function(content, i) {
            var p = files[i];

            grunt.log.subhead('processhtml - ' + p);

            // make sure to convert back into utf8, `file.read` when used as a
            // forEach handler will take additional arguments, and thus trigger the
            // raw buffer read
            content = content.toString();

            // Replace and concatenate blocks of CSS/JS in HTML files
            content = replaceBlocks(content);

            // overwrite file with replaced blocks
            grunt.file.write(p, content);
            grunt.log.writeln('Links in "' + p + '" updated to use concat versions.');
        });
    });


    /**
     * Process files with the blocks and compress the files within them.
     */
    function replaceBlocks(content) {
        var blocks = getBlocks(content);

        // Handle blocks
        blocks.forEach(function(el) {
            var block = el.raw.join(linefeed);
            var type = el.type;
            var dest = el.dest;

            // Fail task if errors were logged.
            if (this.errorCount) { return false; }

            // Update the content to reference the concatenated and versioned files
            content = usemin(type, content, block, dest);
        });

        return content;
    }

    function getBlocks(body) {
        // Start build pattern
        // <!-- build:[type] destination -->
        // TODO: use better regex for dest match
        var regexBuildStart = /<!--\s*build:(\w+)\s*(.+)\s*-->/;
        // End build pattern
        // <!-- endbuild -->
        var regexBuildEnd = /<!--\s*endbuild\s*-->/;
        var regexComment = /<!--(.*)-->/;
        // Match single or double quotes
        var regexSrc = /src=['"]([^"']+)["']/;
        var regexHref = /href=['"]([^"']+)["']/;

        var lines = body.replace(/\r\n/g, '\n').split(/\n/);
        var isBlock = false;
        var sections = [];
        var src;
        var raw;
        var i = 0;

        lines.forEach(function(line) {
            var buildParams = line.match(regexBuildStart);
            var isBuild = regexBuildStart.test(line);
            var isBuildEnd = regexBuildEnd.test(line);
            var isComment = regexComment.test(line);

            if (isBuild) {
                isBlock = true;
                sections[i] = {};
                sections[i].type = buildParams[1].trim();
                sections[i].dest = buildParams[2].trim();
                sections[i].src = src = [];
                sections[i].raw = raw = [];
                i++;
            }

            if (isBlock && raw && src) {
                raw.push(line);

                if (!isComment) {
                    if (regexSrc.test(line)) {
                        src.push(line.match(regexSrc)[1]);
                    }
                    if (regexHref.test(line)) {
                        src.push(line.match(regexHref)[1]);
                    }
                }

                if (isBuildEnd) {
                    isBlock = false;
                }
            }
        });

        return sections;
    }
};