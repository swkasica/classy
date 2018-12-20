import * as dotenv from 'dotenv';
import Log, {LogLevel} from "./Log";
// const dotenv = require('dotenv');
const result = dotenv.config({path: __dirname + '/../../.env'});

if (result.error) {
    Log.error("Failed to parse .env " + result.error);
    throw result.error;
}

/**
 * Master list of courses supported by Classy. Config.name should
 * always be set to one of these in .env.
 */
export enum ConfigCourses {
    classytest = "classytest",

    cs310 = "cs310",
    cs340 = "cs340",

    sdmm = "sdmm", // edX micromasters capstone project
}

export enum ConfigKey {
    name = "name", // name of the course (e.g., cs310, cs340, secapstone, classytest) // should be stable between course instances
    org = "org",
    testorg = "testorg",
    testname = "testname",

    publichostname = "publichostname",

    backendUrl = "backendUrl",
    backendPort = "backendPort",

    mongoUrl = "mongoUrl",

    githubAPI = "githubAPI",
    githubBotName = "githubBotName",
    githubBotToken = "githubBotToken",
    githubDockerToken = "githubDockerToken",
    githubClientId = "githubClientId",
    githubClientSecret = "githubClientSecret",
    githubHost = "githubHost",

    autotestUrl = "autotestUrl",
    autotestPort = "autotestPort",
    autotestSecret = "autotestSecret",

    sslKeyPath = "sslKeyPath",
    sslCertPath = "sslCertPath",

    // autotest
    persistDir = "persistDir",
    hostDir = "hostDir",
    dockerUid = "dockerUid",
    hostsAllow = "hostsAllow",
    dockerHost = "dockerHost",
    timeout = "timeout",
    botName = "botName",
    postback = "postback",
}

export default class Config {

    public static getInstance(): Config {
        if (Config.instance === null) {
            const c = new Config();
            Config.instance = c;
        }
        return Config.instance;
    }

    protected static instance: Config = null;

    private config: any;

    private constructor() {
        // should not be called by clients but typescript does not allow private constructors
        try {
            this.config = {
                name:     process.env.NAME,
                org:      process.env.ORG,
                testorg:  process.env.ORGTEST,
                testname: process.env.NAMETEST,

                publichostname: process.env.PUBLICHOSTNAME,

                hostDir:  process.env.HOST_DIR,
                postback:   Boolean(process.env.AUTOTEST_POSTBACK),
                persistDir: process.env.PERSIST_DIR,
                dockerUid: process.env.UID,
                hostsAllow: process.env.HOSTS_ALLOW,
                dockerHost: process.env.DOCKER_HOST_URL,

                timeout: Number(process.env.GRADER_TIMEOUT),
                botName: process.env.GH_BOT_USERNAME,

                sslCertPath:     process.env.SSL_CERT_PATH,
                sslKeyPath:      process.env.SSL_KEY_PATH,

                mongoUrl: process.env.DB_URL,

                backendPort:  process.env.BACKEND_PORT,
                backendUrl:   process.env.BACKEND_URL,

                githubHost:         process.env.GH_HOST,
                githubAPI:          process.env.GH_API,
                githubBotName:      process.env.GH_BOT_USERNAME,
                githubBotToken:     process.env.GH_BOT_TOKEN,
                githubClientId:     process.env.GH_CLIENT_ID,
                githubClientSecret: process.env.GH_CLIENT_SECRET,
                githubDockerToken:  process.env.GH_DOCKER_TOKEN,

                autotestUrl:    process.env.AUTOTEST_URL,
                autotestPort:   process.env.AUTOTEST_PORT,
                autotestSecret: process.env.AUTOTEST_SECRET,
            };

            // this is not a great place for this
            // but at least it should happen near the start of any execution
            Log.info("Config - Log::<init>");
            const ci = process.env.CI;
            if (typeof ci !== 'undefined' && Boolean(ci) === true) {
                Log.info("Config - Log::<init> - CI detected; changing to INFO");
                Log.Level = LogLevel.INFO; // change to INFO from TRACE if on CI
            } else {
                Log.info("Config - Log::<init> - CI NOT detected");
            }

            const hostname = this.config.publichostname;
            if (hostname.indexOf("://localhost") < 0) {
                Log.info("Config - Log::<init> - Prod detected; changing to INFO");
                Log.Level = LogLevel.INFO;
            } else {
                Log.info("Config - Log::<init> - Prod NOT detected");
            }

        } catch (err) {
            Log.error("Config::<init> - fatal error reading configuration file: " + err);
        }
    }

    public getProp(prop: ConfigKey): any {
        if (typeof this.config[prop] === "undefined") {
            Log.error("Config::getProp(...) - property is undefined; you probably want this in your config file.");
            Log.error("Config::getProp( " + prop + " ) - property is undefined; you probably want this in your config file.");
        } else if (this.config[prop] === null) {
            Log.error("Config::getProp(...) - property is null.");
            Log.error("Config::getProp( " + prop + " ) - property is null");
        } else {
            return this.config[prop];
        }
        return null;
    }

    public setProp(prop: ConfigKey, val: any) {
        if (Config.getInstance().getProp(ConfigKey.name) !== Config.getInstance().getProp(ConfigKey.testname)) {
            if ((prop === ConfigKey.name && val === Config.getInstance().getProp(ConfigKey.testname)) === false) {
                Log.error("Config::setProp( " + prop + ", " + val + " ) - should only be done by test suites, not production code");
            }
        }
        // only test code should really be setting properties on the fly like this
        Log.warn("Config::setProp( " + ConfigKey[prop] + ", " + val + " )");
        this.config[prop] = val;
    }
}
