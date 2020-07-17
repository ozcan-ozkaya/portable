/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../kubevious.git/src/lib/snapshot-processors/alert-count.js                                  ***/

module.exports = {
    order: 200,

    handler: ({logger, state}) => {

        for(var dn of state.getNodeDns())
        {
            processNode(dn);
        }

        /************/

        function processNode(dn)
        {
            var node = state.editableNode(dn);
            node.selfAlertCount = {
            };
    
            var assets = state.getAssets(dn);
            for(var alert of assets.alerts)
            {
                if (!node.selfAlertCount[alert.severity]) {
                    node.selfAlertCount[alert.severity] = 0;
                }
                node.selfAlertCount[alert.severity] += 1;
            }
        }
    }
}