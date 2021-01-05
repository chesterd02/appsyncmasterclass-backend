const given = require ('../../steps/given')
const when = require ('../../steps/when')
const then = require ('../../steps/then')
const chance = require ('chance').Chance()

describe('When confirmUserSignup runs', () => {
    it("The user's profile should be saved in DynamoDB", async () => {
      const { name, email } = given.a_random_user()
      const username = chance.guid()
      await when.we_invoke_confirmUserSignup(username, name, email)
        console.log(`when was successful`)
      const ddbUser = await then.user_exists_in_UsersTable(username)
      console.log (`ddbUser id: ${ddbUser.id}`)
      console.log (`ddbUser createdat: ${ddbUser.createdAt}`)
      console.log (`ddbUser Name: ${ddbUser.name}  matches Name: ${name}`)

    //   expect (ddbUser).toHaveProperty('id' , username )
    //   expect (ddbUser).toHaveProperty('name' , name )
    //   expect (ddbUser).toHaveProperty('followersCount' , 0 )
    //   expect (ddbUser).toHaveProperty('followingCount' , 0 )
    //   expect (ddbUser).toHaveProperty('tweetsCount' , 0 )
    //   expect (ddbUser).toHaveProperty('likesCount' , 0 )

      expect(ddbUser).toMatchObject({
        id: username,
        name: name,
        createdAt: expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g),
        followersCount: 0,
        followingCount: 0,
        tweetsCount: 0,
        likesCount: 0
      })
      console.log('matched user')
  
      const [firstName, lastName] = name.match(/[A-Z][a-z]+/g)
      console.log(`firstName: ${firstName}`)
      console.log(`lastName: ${lastName}`)
      expect(ddbUser.screenName).toContain(firstName)
      expect(ddbUser.screenName).toContain(lastName)
    })
  })