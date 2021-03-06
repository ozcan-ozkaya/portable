/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../kubevious.git/src/lib/snapshot-processors/200_children-count.js                           ***/

const _ = require('lodash');


module.exports = {
    order: 200,

    handler: ({logger, state}) => {


        state.traverseNodes((dn, node) => {

            var childrenDns = state.getChildrenDns(dn);
            node.childrenCount = childrenDns.length;

        })

    }
}