/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../kubevious.git/src/lib/utils/name-helpers.js                                               ***/

module.exports.makeRelativeName = function(parentName, name) {
    var prefix = parentName + "-";
    if (name.startsWith(prefix)) {
        return name.substring(prefix.length);
    }
    return name;
}