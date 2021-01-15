require('dotenv').config()
const when = require('../../steps/when')
const chance = require('chance').Chance()

describe('When getImageUploadUrl runs', () => {
    console.log("test runs")
    it.each([
        [ '.png', 'image/png' ],
        [ '.jpg', 'image/jpeg' ],
        [ '.png', null ],
        [ '.jpeg', null ],
        [ null, 'image/png' ],
        [ null, null ]
    ])('Returns a signed S3 url', async (extension, contentType) => {
        console.log("it runs")
        const username = chance.guid()
        console.log("username works")
        const signedUrl = await when.we_invoke_getImageUploadUrl(username, extension, contentType)
        console.log("have a signed Url")
        const { BUCKET_NAME } = process.env
        console.log(`Bucket name is: ${BUCKET_NAME}`)
        const regex = new RegExp(`https://${BUCKET_NAME}.s3-accelerate.amazonaws.com/${username}/.*${extension || ''}\?.*Content-Type=${contentType ? contentType.replace('/', '%2F') : 'image%2Fjpeg'}.*`)
        const myRegex = new RegExp(".*")
        expect (signedUrl).toMatch(myRegex)
        expect (signedUrl).toMatch(regex)
    })
})