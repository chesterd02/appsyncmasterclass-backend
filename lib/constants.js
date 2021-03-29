const TweetTypes = {
    TWEET: 'Tweet',
    RETWEET: 'Retweet',
    REPLY: 'Reply'
}

const DynamoDb ={
    MAX_BATCH_SIZE = 25
}

const SearchModes = {
    PEOPLE: 'People',
    LATEST: 'Latest'
  }

module.exports = {
    TweetTypes,
    DynamoDb,
    SearchModes
}