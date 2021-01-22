require('dotenv').config()
const AWS = require('aws-sdk')
const GraphQL = require('../lib/graphql')
const fs = require('fs')
const velocityMapper = require('amplify-appsync-simulator/lib/velocity/value-mapper/mapper')
const velocityTemplate = require('amplify-velocity-template')

const we_invoke_confirmUserSignup = async (username, name, email) => {
    const handler = require('../../functions/confirm-user-signup').handler
  
    const context = {}
    const event = {
      "version": "1",
      "region": process.env.AWS_REGION,
      "userPoolId": process.env.COGNITO_USER_POOL_ID,
      "userName": username,
      "triggerSource": "PostConfirmation_ConfirmSignUp",
      "request": {
        "userAttributes": {
          "sub": username,
          "cognito:email_alias": email,
          "cognito:user_status": "CONFIRMED",
          "email_verified": "false",
          "name": name,
          "email": email
        }
      },
      "response": {}
    }
  
    await handler(event, context)
  }

const a_user_signs_up = async (password, name, email) => {
    const cognito = new AWS.CognitoIdentityServiceProvider()

    const userPoolId = process.env.COGNITO_USER_POOL_ID
    const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID

    const signUpResp = await cognito.signUp({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [
        { Name: 'name', Value: name }
        ]
    }).promise()

    const username = signUpResp.UserSub
    console.log(`[${email}] - user has signed up [${username}]`)

    try{
        await cognito.adminConfirmSignUp({
        UserPoolId: userPoolId,
        Username: username
        }).promise()
    }
    catch(err){
        console.log('error thrown in confirmsignup', err)
    }


    console.log(`*************[${email}] - confirmed sign up`)

    return {
        username,
        name,
        email
    }
}

const a_user_calls_getMyProfile = async (user) => {
  const getMyProfile = `query MyQuery {
    getMyProfile {
      backgroundImageUrl
      bio
      birthdate
      createdAt
      followersCount
      followingCount
      id
      imageUrl
      likesCount
      location
      name
      screenName
      tweetsCount
      website
    }
  }`

  const data = await GraphQL(process.env.API_URL, getMyProfile, {}, user.accessToken)
  const profile = data.getMyProfile

  console.log(`${user.username} - fetched profile`)

  return profile
}

const we_invoke_getImageUploadUrl = async (username, extension, contentType) => {
  const handler = require('../../functions/get-upload-url').handler
  console.log("handler works")
  const context = {}
  const event = {
    identity: {
      username
    },
    arguments: {
      extension,
      contentType
    }
  }
  console.log("almost done with when")
  return await handler(event, context)
}

const a_user_calls_getImageUploadUrl = async (user, extension, contentType) => {
  const getImageUploadUrl = `query getImageUploadUrl($extension: String, $contentType: String) {
    getImageUploadUrl(extension: $extension, contentType: $contentType) 
  }`
  const variables = {
    extension,
    contentType
  }

  const data = await GraphQL(process.env.API_URL, getImageUploadUrl, variables, user.accessToken)
  const url = data.getImageUploadUrl

  console.log(`[${user.username}] - got image upload url`)

  return url
}

const we_invoke_tweet = async (username, text) => {
  const handler = require('../../functions/tweet').handler
  
  const context = { }
  const event = {
    identity: {
      username
    },
    arguments: [
      text
    ]
  }

  return await handler(event, context)
}

const a_user_calls_tweet = async (user, text) => {
  const tweet = `mutation tweet($text: String!) {
    tweet(text: $text) {
      id
      profile {
        id 
        name
        screenName
      }
      createdAt
      text
      replies
      likes
      retweets
    }
  }`
  const variables = {
    text
  }

  const data = await GraphQL(process.env.API_URL, tweet, variables, user.accessToken)
  const newTweet = data.tweet

  console.log(`[${user.username}] - posted new tweet`)

  return newTweet
}

const we_invoke_an_appsync_template = (templatePath, context) => {
  const template = fs.readFileSync(templatePath, { encoding: 'utf-8' })
  const ast = velocityTemplate.parse(template)
  const compiler = new velocityTemplate.Compile(ast, {
    valueMapper: velocityMapper.map,
    escape: false
  })
  return JSON.parse(compiler.render(context))
}

const a_user_calls_getTweets = async (user, userId, limit, nextToken) => {
  const getTweets = `query getTweets($userId: ID!, $limit: Int!, $nextToken: String) {
    getTweets(userId: $userId, limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets {
        id
        createdAt
        profile {
          id 
          name
          screenName
        }

        ... on Tweet {
          text
          replies
          likes
          retweets
        }
      }
    }
  }`
  const variables = {
    userId,
    limit,
    nextToken
  }

  const data = await GraphQL(process.env.API_URL, getTweets, variables, user.accessToken)
  const newTweet = data.getTweets

  console.log(`[${user.username}] - posted new tweet`)

  return newTweet
}

module.exports = {
    we_invoke_confirmUserSignup,
    a_user_signs_up,
    a_user_calls_getMyProfile,
    we_invoke_getImageUploadUrl,
    a_user_calls_getImageUploadUrl,
    we_invoke_tweet,
    a_user_calls_tweet,
    we_invoke_an_appsync_template,
    a_user_calls_getTweets
}