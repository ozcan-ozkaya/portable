/*** UNDER NO CIRCUMSTANCES DO NOT EDIT THIS FILE. THIS FILE IS COPIED                                    ***/
/*** FROM OSS UI. ANY CHANGES TO BE MADE IN KUBEVIOUS OSS UI.                                             ***/
/*** SOURCE: ../ui.git/src/src/components/About/index.js                                                  ***/

import React from 'react'
import { isEmptyArray } from '../../utils/util'

const About = ({ result }) => {
    return(
        <div className="About-wrapper p-40 overflow-hide">
            <div className="container-header">
                <h3>About Kubevious</h3>
            </div>
            <table className="table table-striped table-dark">
                <thead>
                <tr>
                    <th>Property</th>
                    <th>Value</th>
                </tr>
                </thead>
                <tbody>
                {!isEmptyArray(result) && Object.entries(result).map(item => (
                    <tr key={item[1]}>
                        <td>{item[0]}</td>
                        <td>{item[1]}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default About
