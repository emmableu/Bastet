/*
 *   BASTET Program Analysis and Verification Framework
 *
 *   Copyright 2019 by University of Passau (uni-passau.de)
 *
 *   Maintained by Andreas Stahlbauer (firstname@lastname.net),
 *   see the file CONTRIBUTORS.md for the list of contributors.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
import path from "path"
import {Bastet} from "../../../../../src/bastet/Bastet";
import {AnalysisResult, MultiPropertyAnalysisResult} from "../../../../../src/bastet/procedures/AnalysisProcedure";

let intermediateRelPath = "../../../../../src/public/intermediate.sc";
let intermediatePath = path.join(__dirname, intermediateRelPath);

let configRelPath = "../../../../config/default.json"
let configFilePath = path.join(__dirname, configRelPath);

let specRelPath = "../../../../specs/empty.sc"
let specFilePath = path.join(__dirname, specRelPath);

let timeout: number = 20000
export {timeout, execute, execute_explicit};


function execute(bastet: Bastet, fixturePath: string, done) {
    if (fixturePath.endsWith("_SAFE.sc")) {
        execute_explicit(bastet, fixturePath, true, done)
    } else if (fixturePath.endsWith("_UNSAFE.sc")) {
        execute_explicit(bastet, fixturePath, false, done)
    } else {

    }
}

function execute_explicit(bastet: Bastet, fixturePath: string, expectSuccess: boolean, done) {
    async function asyncAwaitFunction(): Promise<AnalysisResult> {
        return await bastet.runFor(configFilePath, intermediatePath, fixturePath, specFilePath);
    }

    asyncAwaitFunction().then(result => {
            let analysisResult: MultiPropertyAnalysisResult = result as MultiPropertyAnalysisResult;
            if (expectSuccess && analysisResult.satisfied.size < 1) {
                expect(analysisResult.satisfied.size).resolves.toBeGreaterThan(1)
            } else if (!expectSuccess) {
                expect(analysisResult.violated.size).resolves.toBeGreaterThan(1)
            }
            done()
        }
    );
}