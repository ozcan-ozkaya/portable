/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../ui.git/src/src/components/ErrorBox/index.js                                               ***/

import React, { useState } from 'react';
import { faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './styles.scss'

const ErrorBox = ({ error, closeError }) => {
    const [expanded, setExpanded] = useState(false)

    const { data: { message, stack }, status } = error

    return (
        <div className="ErrorBox-container">
            <div className="error">
                <div className="error-text">
                    Error {status}: {message}
                </div>

                <div className="more-text">
                    {expanded && <FontAwesomeIcon icon={faTimes} onClick={() => closeError()} />}
                    {!expanded && <FontAwesomeIcon icon={faChevronDown} onClick={() => setExpanded(true)} />}
                </div>
            </div>

            {expanded && <div className="full-error-container">
                {status === 500 && <div className="msg retry">Please try refreshing the page</div>}
                <div className="msg">Error occurred: {message ? message : error.data}</div>
                {stack && <div className="msg">{stack}</div>}
            </div>}
        </div>
    )
}

export default ErrorBox
