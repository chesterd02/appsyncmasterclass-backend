require('dotenv').config()
const given = require ('../../steps/given')
const when = require ('../../steps/when')
const then = require ('../../steps/then')
const path = require ('path')

describe ('Given an authenticated user', () => {
    let user
    beforeAll (async () => {
        user = await given.an_authenicated_user()
    })

    it('The user can fetch his profile with getMyProfile', async() => {
        const profile = await when.a_user_calls_getMyProfile(user)
        console.log ('called getMyProfile: ', JSON.stringify(profile))

        expect(profile).toMatchObject({
            id : user.username,
            name: user.name,
            imageUrl: null,
            backgroundImageUrl: null,
            bio: null,
            location: null,
            website: null,
            birthdate: null,
            createdAt: expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g),
            followersCount: 0,
            followingCount: 0,
            tweetsCount: 0,
            likesCount: 0
        })


    })

    it ('The user can get URL to upload new profile image', async () =>{
        const uploadUrl = await when.a_user_calls_getImageUploadUrl(user, '.png', 'image/png')

        const bucketName = process.env.BUCKET_NAME
        const regex = new RegExp(`https://${bucketName}.s3-accelerate.amazonaws.com/${user.username}/.*\.png\?.*Content-Type=image%2Fpng.*`)
        expect (uploadUrl).toMatch(regex)

        const filePath = path.join(__dirname, '../../data/logan.png')
        await then.user_can_upload_image_to_url(uploadUrl, filePath, 'image/png')

        const downloadUrl = uploadUrl.split('?')[0]
        await then.user_can_download_image_from (downloadUrl)
    })
})