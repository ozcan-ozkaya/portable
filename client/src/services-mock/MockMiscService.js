/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../ui.git/src/src/services-mock/MockMiscService.js                                           ***/

class MockMiscService {
    constructor(parent) {
        this._parent = parent
    }

    fetchAbout(cb) {
        var info = {
            version: require('../version'),
        }

        return Promise.resolve()
            .then(() => {
                return Promise.resolve()
                    .then(() => {
                        info['backend version'] = 'v1.2.3';
                    })
                    .catch(() => {
                        info['backend version'] = 'unknown';
                    });
            })
            .then(() => {
                cb(info)
            })
    }

}

export default MockMiscService
