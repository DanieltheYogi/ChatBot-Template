// This loads the environment variables from the .env file
require('dotenv-extended').load();


//require('dotenv').config();
var restify = require('restify');
var builder = require('botbuilder');



// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
	console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
	appId: process.env.MICROSOFT_APP_ID /* MICROSOFT_APP_ID */,
	appPassword: process.env.MICROSOFT_APP_PASSWORD /* MICROSOFT_APP_PASSWORD */
});

// Listen for messages from users
server.post('/api/messages', connector.listen());




// Create your bot with a function to receive messages from the user
// Create bot and default message handler
var bot = new builder.UniversalBot(connector, function (session) {
	session.send("Hi! I'm Pepper and I'm an ambassador of the Uniqlo brand. ");

    initializeConversationData(session);

    // Kick off convo with Gender Prompt
    session.beginDialog("GenderPrompt");
});


// You can provide your own model by specifing the 'LUIS_MODEL_URL' environment variable
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);


// Dialog Prompts
// 1.) Gender Prompt
bot.dialog('GenderPrompt', function (session) {
    session.send("Are you shopping for Men's or Women's clothing today?");
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    msg.attachments([
        new builder.HeroCard(session)
            //.title("Men's")
            .images([builder.CardImage.create(session, 'https://image.freepik.com/freie-ikonen/anzug-und-krawatte-outfit_318-42494.jpg')])
            .buttons([
                builder.CardAction.imBack(session, "I'm shopping for Men's clothing", "Men's")
            ]),
        new builder.HeroCard(session)
            //.title("Women's")
            .images([builder.CardImage.create(session, 'https://kopiradio.files.wordpress.com/2016/03/dress-dummy_318-285051.jpg')])
            .buttons([
                builder.CardAction.imBack(session, "I'm shopping for Women's clothing", "Women's")
            ])
    ]);
    session.send(msg).endDialog();   
});

// 2.) Context Prompt
bot.dialog('ContextPrompt', function (session) {
    session.send("Are you shopping for clothing for at home, at work, or out on the town?");
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    msg.attachments([
        new builder.HeroCard(session)
            //.title("Home")
            .images([builder.CardImage.create(session, 'http://lblawntogarden.com/wp-content/uploads/2016/08/L2G-Logo-Icon-revised-blue-280x280.png')])
            .buttons([
                builder.CardAction.imBack(session, "At home", "Home")
            ]),
        new builder.HeroCard(session)
            //.title("Work")
            .images([builder.CardImage.create(session, 'https://www.datarespons.com/wp-content/uploads/2014/11/management-icon-01-280x280.png')])
            .buttons([
                builder.CardAction.imBack(session, "At work", "Work")
            ]),
        new builder.HeroCard(session)
            //.title("On the town")
            .images([builder.CardImage.create(session, 'http://auburn.edu/administration/housing/images/icons/housing_reshalls.png')])
            .buttons([
                builder.CardAction.imBack(session, "Out on the town", "On the town")
            ])
    ]);
    session.send(msg).endDialog();   
});

// 3.) Style Prompt
bot.dialog('StylePrompt', function (session) {
    session.send("How would you describe your style? If you had to choose..");
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    msg.attachments([
        new builder.HeroCard(session)
            //.title("Classy")
            .images([builder.CardImage.create(session, 'https://d30y9cdsu7xlg0.cloudfront.net/png/41828-200.png')])
            .buttons([
                builder.CardAction.imBack(session, "Classy", "Classy")
            ]),
        new builder.HeroCard(session)
            //.title("Bold")
            .images([builder.CardImage.create(session, 'https://d30y9cdsu7xlg0.cloudfront.net/png/9601-200.png')])
            .buttons([
                builder.CardAction.imBack(session, "Bold", "Bold")
            ]),
        new builder.HeroCard(session)
            //.title("Trendy")
            .images([builder.CardImage.create(session, 'https://d30y9cdsu7xlg0.cloudfront.net/png/78237-200.png')])
            .buttons([
                builder.CardAction.imBack(session, "Trendy", "Trendy")
            ]),
        new builder.HeroCard(session)
            //.title("Casual")
            .images([builder.CardImage.create(session, 'https://d30y9cdsu7xlg0.cloudfront.net/png/35312-200.png')])
            .buttons([
                builder.CardAction.imBack(session, "Casual", "Casual")
            ])
    ]);
    session.send(msg).endDialog();     
});

// 4.) Disliked Colors Prompt
bot.dialog('DislikedColorsPrompt', function (session) {
    let msg = new builder.Message(session)
        .text("Are there any colors you dislike?")
        .suggestedActions(
            builder.SuggestedActions.create(
                    session, [
                        builder.CardAction.imBack(session, "Green", "Green"),
                        builder.CardAction.imBack(session, "Blue", "Blue"),
                        builder.CardAction.imBack(session, "Green", "Green"),
                        builder.CardAction.imBack(session, "Grey", "Grey"),
                        builder.CardAction.imBack(session, "Beige", "Beige"),
                        builder.CardAction.imBack(session, "Pink", "Pink"),
                        builder.CardAction.imBack(session, "Purple", "Purple"),
                        builder.CardAction.imBack(session, "Orange", "Orange"),
                        builder.CardAction.imBack(session, "Yellow", "Yellow"),
                        builder.CardAction.imBack(session, "Black", "Black"),
                        builder.CardAction.imBack(session, "White", "White"),
                        builder.CardAction.imBack(session, "Brown", "Brown")
                    ]
                ));
    session.send(msg);
});

// 5.) Clothing Recommendation
bot.dialog('ClothingRecommendation', function (session) {
    session.send("I have a recommendation just for you based on the information you gave me. How about this outfit?");
    var msg = processPreferencesAndGetRecommendation(session);
    session.send(msg).endDialog();
    clearUserData(session);
});



//------------------------------------------/
/*      END PROMPTS || BEGIN RESPONSES     */
//------------------------------------------/
// Use LUIS-triggered responses to parse user data
// 1) Process Gender
bot.dialog('ProcessGenderClothing', function (session, args, next) {
    var intent = args.intent;
    var gender = builder.EntityRecognizer.findEntity(intent.entities, 'ChosenGender');
    var relation = builder.EntityRecognizer.findEntity(intent.entities, 'Relation');
    if (gender) {
        gender_normalized = null;
        if (["male", "man", "men"].indexOf(gender.entity) > -1) {
            gender_normalized = "male";
        }
        if (["female", "women", "woman"].indexOf(gender.entity) > -1) {
            gender_normalized = "female";
        }
        session.conversationData.shoppingProfile.gender = gender_normalized;
        removeDialogFromList(session, "gender");
        session.send("Got it. Gender is: " + gender_normalized).endDialog();
        continueWithPrompts(session);
    } else if (relation) {
        session.send("Got it. Relation is: " + relation.entity).endDialog();
    } else {
        session.send("Sorry. I didn't get that.");
    } 
}).triggerAction( {
    matches: "ChooseGender"
});

// 2) Process Context
// Use LUIS-triggered responses to parse user data
bot.dialog('ProcessLocation', function (session, args, next) {
    var intent = args.intent;
    var location = builder.EntityRecognizer.findEntity(intent.entities, 'LocationOfClothingUsage');
    if (location) {
        session.conversationData.shoppingProfile.context = location.entity;
        removeDialogFromList(session, "context");
        session.send("Got it. Context is: " + location.entity).endDialog();
        continueWithPrompts(session);
    }
   
}).triggerAction( {
    matches: "IndicateLocationOfClothingUsage"
});


// 3) Process Style
// Use LUIS-triggered responses to parse user data
bot.dialog('ProcessStyle', function (session, args, next) {
    var intent = args.intent;
    var style = builder.EntityRecognizer.findEntity(intent.entities, 'Style');
    if (style) {
        session.conversationData.shoppingProfile.context = style.entity;
        removeDialogFromList(session, "style");
        session.send("Got it. Style is: " + style.entity).endDialog();
        continueWithPrompts(session);
    }
   
}).triggerAction( {
    matches: "IndicateStyle"
});

// 4) Process Disliked Colors
// Use LUIS-triggered responses to parse user data
bot.dialog('ProcessDislikedColors', function (session, args, next) {
    var intent = args.intent;
    var dislikedColors = builder.EntityRecognizer.findEntity(intent.entities, 'DislikedColors');
    if (dislikedColors) {
        console.log(intent);
        console.log(dislikedColors);
        session.send(Object.keys(dislikedColors));
        session.conversationData.shoppingProfile.dislikedColors = dislikedColors.entity;
        removeDialogFromList(session, "dislikedColors");
        session.send("Got it. Disliked color(s) is: " + dislikedColors.entity).endDialog();
        continueWithPrompts(session);
    }
   
}).triggerAction( {
    matches: "SpecifyDislikedColors"
});


bot.dialog('Initiate', function (session, args, next) {
    initializeConversationData(session);
    var greetingList = ["Hi!","Hello!","Hey!","Greetings!","Why hello!","Hello human!"];
    var greeting = randomValue(greetingList);
    session.send(greeting);
    continueWithPrompts(session);   
}).triggerAction( {
    matches: "InitiateBot"
});

//--------------------------------------/
/*          HELPER FUNCTIONS           */
//--------------------------------------/

function randomValue(array){
    return array[Math.floor(Math.random() * array.length)];
}
function initializeConversationData(session) {
    /* session.conversationData.shoppingProfile will store session data for each section of the dialog:
              gender: male || female
              context: work || home || on the town
              style: classy || bold || trendy || casual
              dislikedColors: [grey, blue, red, beige, pink, purple, orange, yellow, green, black, brown, white]
       The data will all be initialized with null values and filled in as the dialog progresses.   */
    session.conversationData.shoppingProfile = {
        gender: null,
        context: null,
        style: null,
        dislikedColors: null
    };
    // session.conversationData.dialogPrompts provides a mapping of profile datums to dialog prompts 
    session.conversationData.dialogPrompts = {
        gender: 'GenderPrompt',
        context: 'ContextPrompt',
        style: 'StylePrompt',
        dislikedColors: 'DislikedColorsPrompt'
    }
    // Track which dialog prompts need to triggered to complete the flow
    session.conversationData.profileUncompleted = Object.keys(session.conversationData.shoppingProfile)
}

function clearUserData(session) {
    session.conversationData.shoppingProfile = {};
}

function processPreferencesAndGetRecommendation(session){
    // If doing this for real, the user data would inform the recommendation
    // For this example, just return dummy data:
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel);
    msg.attachments([
        new builder.HeroCard(session)
            //.title("Trendy Shirt")
            .images([builder.CardImage.create(session, 'https://uniqlo.scene7.com/is/image/UNIQLO/goods_03_183592?$prod$')])
            .buttons([
                builder.CardAction.imBack(session, "Easy Care Comfort Shirt", "Easy Care Comfort Shirt")
            ]),
        new builder.HeroCard(session)
            //.title("Trendy Pants")
            .images([builder.CardImage.create(session, 'https://uniqlo.scene7.com/is/image/UNIQLO/goods_32_400483?$prod$')])
            .buttons([
                builder.CardAction.imBack(session, "Blocktech Slim-Fit Chino Flat-Front", "Blocktech Slim-Fit Chino")
            ]),
        new builder.HeroCard(session)
            //.title("Trendy Belt")
            .images([builder.CardImage.create(session, 'https://uniqlo.scene7.com/is/image/UNIQLO/goods_34_400827?$prod$')])
            .buttons([
                builder.CardAction.imBack(session, "Italian Leather Suade Belt", "Italian Leather Suade Belt")
            ]),
        new builder.HeroCard(session)
            //.title("Trendy Sunglasses")
            .images([builder.CardImage.create(session, 'https://uniqlo.scene7.com/is/image/UNIQLO/goods_08_191335?$prod$')])
            .buttons([
                builder.CardAction.imBack(session, "Wellington Folding Sunglasses", "Wellington Folding Sunglasses")
            ])
    ]);
    return msg;
}
function removeDialogFromList(session, whichDialogToRemove) {
    session.conversationData.profileUncompleted = session.conversationData.profileUncompleted.filter(function(dialog){
        return dialog !== whichDialogToRemove;
    })
}

function continueWithPrompts(session) {
    if (session.conversationData.profileUncompleted.length > 0) {
        session.beginDialog(session.conversationData.dialogPrompts[session.conversationData.profileUncompleted[0]]);
    } else {
        session.beginDialog("ClothingRecommendation");
    }
}

function heroCardHelper(cardToBuild) {
    return new builder.HeroCard()
        .title(hotel.name)
        .subtitle('%d stars. %d reviews. From $%d per night.', hotel.rating, hotel.numberOfReviews, hotel.priceStarting)
        .images([new builder.CardImage().url(hotel.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=hotels+in+' + encodeURIComponent(hotel.location))
        ]);
}