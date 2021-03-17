const TweetTypes = {
    TWEET: 'Tweet',
    RETWEET: 'Retweet',
    REPLY: 'Reply'
}

const DynamoDb ={
    MAX_BATCH_SIZE = 25
}

module.exports = {
    TweetTypes,
    DynamoDb
}