# SOLSQUARE

### You own what you create.
![image](./Assets/logoB.png)

SolSquare is a decentralized censorship-free tweet platform that promotes economic incentives for good behavior.

# Fast Links:

- WebDapp: https://www.solsquare.net/
- BackEnd Code: [Code](./Backend/)
- FrontEnd Code: [Code](./Frontend%20-%20NextJS/)
- Pitch Deck: [Deck](./Presentation/)
- User Guide: [User-Guide](./User%20Guide/)
- Video Demo: [Video](https://www.youtube.com/watch?v=ngT85GfFafg)

# Inspiration

Centralized social media platforms have shown the tendency to censor user data, and influence perception. 

<img src="./Assets/censor.png">

Heated debates have happened on censorship and algorithmic control. [1](#references).

This is what users feel like on centralized content platforms.

<img src="./Assets/cancelled-picture.png">

Social platforms make a profit by charging you for access or selling your attention. What if it was inexpensive? 

<img src="./Assets/block.png">

SolSquare was conceptualized to promote cost-effective censorship-free expression, yet use economic incentives for good behavior through boosting, for consent or dissent. 

# Solution:

SolSquare is like a digital decentralized space for open expression without anyone controlling what's said. It encourages good behavior by rewarding positive contributions by boosts. Built on Solana, it's fast and secure, ensuring everyone can freely express themselves.

<img src="./Assets/solanaIcon.jpg" >

# System Diagram:

<img src="./Assets/General Diagram.png">

- Solana Native Rust: We built the entire backend in Solana Native Rust because it was easy to add complex functionality to the entire application.

- Vercel and NextJS: Vercel and Next JS were used as part of the front end due to the ease and agility of being able to make an optimal and fast application. 

# Solana Native Rust - BackEnd:

SolSquare is a project designed with several key features in mind. Solana and Rust makes SolSquare fast and reliable.

### Solana as main chain:

1. **High Transaction Throughput**: The platform efficiently handles numerous transactions simultaneously.
   
2. **Low Latency**: Users enjoy near-instant confirmation times for their transactions.
   
3. **Cost-effective Transactions**: SolSquare minimizes transaction fees, ensuring accessibility for all users.
   
4. **High Usability**: The platform offers an intuitive interface and a seamless user experience.
   
5. **Gaining Traction**: SolSquare is rapidly gaining popularity and attracting a growing user base.

### Rust:

The initial step is to configure the [Schemas](./Backend/Backend%20Solsquare%20(Cargo%20Project)/src/state.rs), as they facilitate the serialization and deserialization of all incoming data for the program.

- Tweet (Post) Schema:
  - Content: String
  - Owner: [u8; 32]
  - Timestamp: u32

- User Schema:
  - Owner: [u8; 32]
  - Username: String
  - Timestamp: u32
  - Followers: u32

The second most crucial aspect of the program involves the instructions, which should be pass this as the first 8 bytes of the transaction as u8. While this is just one method, its implementation may vary among programmers.

    pub enum ProgramInstruction {
        AddTweet(TweetData),
        ModifyTweet(TweetDataMod),
        TransferFunds(),
        AddUser(UserData),
        ModifyUser(UserDataMod),
    }

    impl ProgramInstruction {
        pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
            let selector = input[0];
            Ok(match selector {
                0 => {
                    // Code
                },
                1 => {
                    // Code
                },
                2 => {
                    // Code
                },
                3 => {
                    // Code
                },
                4 => {
                    // Code
                },
                _ => return Err(...)
            })
        }
    }

Lastly, the program's basic functions, which currently total five, are as follows:

- Add Tweet: This function creates a PDA account of exactly 168 bytes and adds the information from the aforementioned schema.

- Modify Tweet: This function modifies a PDA account, making only the desired changes.

- Transfer Funds: This function transfers all funds from a tweet to the account owner.

- Add User: This function creates a PDA account of exactly 76 bytes and adds the information from the aforementioned schema.

- Modify User: This function modifies a PDA account, making only the desired changes.

# Vercel and NextJS - FrontEnd:

Using Vercel and Next.js for frontend development simplifies deployment for Next.js apps, making updates effortless.

### Login:

To access the application, logging in to the page is required.

<img src="./Assets/1-login.png">

The app is compatible with all major wallets available in the market.

<img src="./Assets/2-wallets.png">

### Feed Screen:

The entire post feed originates from the Solana network, where each tweet and user is represented as a PDA on the chain.

<img src="./Assets/3-feed.png">

With just one click, users can boost a post, add a new post, or create a new user.

<img src="./Assets/4-post.png">

### Mobile version:

Lastly, it's important to note that in recent years, the majority of users have transitioned to predominantly using mobile phones. Therefore, our app is a progressive web decentralized application (pwd), ensuring full compatibility on mobile devices.

<img src="./Assets/5-screen.png" >

## What next ?

Release to beta test. Please provide your valuable feedback. 

Happy Tweeting !

# References:

1.- https://www.forbes.com/sites/tomerniv/2023/09/07/censorship-and-decentralized-social-media-a-paradigm-shift/?sh=5b5ab044185a
