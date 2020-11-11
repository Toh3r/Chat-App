const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const { IamAuthenticator } = require("ibm-watson/auth");

const languageTranslator = new LanguageTranslatorV3({
    version: "2018-05-01",
    authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_API_KEY,
    }),
    serviceUrl: process.env.WATSON_URL,
});

const translate = (oMessageInfo, callback) => {
    const translateParams = {
        text: oMessageInfo.message,
        modelId: `${oMessageInfo.translateFrom}-${oMessageInfo.translateTo}`,
    };

    languageTranslator
        .translate(translateParams)
        .then((translationResult) => {
            console.log(
                JSON.stringify(
                    translationResult.result.translations[0].translation,
                    null,
                    2
                )
            );
            message = JSON.stringify(
                translationResult.result.translations[0].translation,
                null,
                2
            );
            message = message.slice(1,-1); // Remove qoutes from res
            callback(message);
        })
        .catch((err) => {
            console.log("error:", err);
            callback(err);
        });
};

module.exports = translate;
