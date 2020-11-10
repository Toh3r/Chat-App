const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const { IamAuthenticator } = require("ibm-watson/auth");

const languageTranslator = new LanguageTranslatorV3({
  version: "2018-05-01",
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_API_KEY,
  }),
  serviceUrl: process.env.WATSON_URL,
});

const translate = (message, fromLanguage, toLanguage) => {
  const translateParams = {
    text: "Hello, how are you today?",
    modelId: "en-ga",
  };

  languageTranslator
    .translate(translateParams)
    .then((translationResult) => {
      console.log(JSON.stringify(translationResult.result.translations[0].translation, null, 2));
    })
    .catch((err) => {
      console.log("error:", err);
    });
};

module.exports = translate;
