/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../parser.git/src/lib/logic/polishers/033_container-radioactive.js                           ***/

const _ = require("the-lodash");

module.exports = {
    target: {
        path: ["ns", "app", "cont"]
    },

    order: 33,

    handler: ({scope, item, logger, context}) =>
    {
        var radioactiveProps = {};

        if (_.get(item.config, 'securityContext.privileged')) {
            radioactiveProps['privileged'] = true;
        }

        if (_.keys(radioactiveProps).length > 0)
        {
            item.setPropagatableFlag("radioactive");

            item.addProperties({
                kind: "key-value",
                id: "radioactive",
                title: "Radioactivity",
                order: 7,
                config: radioactiveProps
            });
        }

    }
}
