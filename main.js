const axios = require("axios");
const argv = require("minimist")(process.argv.slice(2));
const config = require("./config.json");

const BASE_URL = "http://localhost:3000";
const testApi = axios.create({
    baseURL: BASE_URL
});
const testParams = {
    recipientId: 3,
    cost: 1,
    senderId: 1,
};

async function getAccessToken(){
    const response = await testApi.post("/account/login", {
        nickname: config.username,
        password: config.password,
    })

    if(response.data){
        return response.data.token;
    }

    return null;
}

function transactionRequest(params, isDisabled = false){
    const qs = isDisabled ? `?isDisabled=true` : '';
    return testApi.post(`/transactions${qs}`, params);
}

function setApiAuthToken(token){
    testApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function runParallelRequests(numOfReqs, enableRace = false){
    Promise.all(
        Array
            .from((Array(numOfReqs)
                .keys()))
            .map(() => transactionRequest(testParams, enableRace))
    );
}

function runThrottleRequests(numOfReqs, delta = 150, enableRace = false){
    let totalCount = 0;
    let idx = setInterval(() => {
        totalCount += 1;

        if(totalCount > numOfReqs) {
            clearInterval(idx);
            return;
        }

        console.log(`request ${totalCount}`)
        transactionRequest(testParams, enableRace)
    }, delta)
}

function getInitialOptions(){
    const baseDelay = argv.delay ?? 150;
    const numOfReqs = argv.count ?? 100;
    const enableRace = argv.raceMode ?? false;
    const mode = argv.mode ?? 'parallel'

    return {
        baseDelay,
        numOfReqs,
        enableRace,
        mode
    }
}

async function runChecker(){
    try{
        const {
            baseDelay,
            numOfReqs,
            enableRace,
            mode
        } = getInitialOptions()

        let accessToken = await getAccessToken();

        if(!accessToken){
            throw Error("No access token!");
        }

        setApiAuthToken(accessToken);

        switch (mode){
            case "parallel":
                await runParallelRequests(numOfReqs, enableRace);
                break;
            case "interval":
                await runThrottleRequests(numOfReqs, baseDelay, enableRace);
                break;
        }
    }catch (e) {
        console.log(e)
    }
}

runChecker()
    .catch(err => console.log(err))
