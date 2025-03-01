# Pirate Land

[![wakatime](https://wakatime.com/badge/user/77078a50-96cc-4da2-b32c-08e468259a40/project/67427208-a43c-4d32-b63e-64ce4cb33825.svg)](https://wakatime.com/@DarkKnight7/projects/bkvjkpvuav)

`Note`: This is the back end code of Pirate Land and the front end code can be found in this repository - https://github.com/Snaehath/pirate-land 

### Bringing Retro Battleship Excitement to Web3

### Links
Project link - https://pirateland.vercel.app/

Submission video - https://drive.google.com/file/d/1sHB28q_YpcvhKrLo_cdRVh7fplaS6x_4/view?usp=sharing

Demo video - https://drive.google.com/file/d/1w2qc3V8b3WdF_FzzfCbqMfnj_3ig7DD4/view?usp=sharing

Presentation - https://docs.google.com/presentation/d/1Sig2T12CpNw6qjJvVRw5SOwfzR4Alc7qDaGf_DPdazw/edit?usp=sharing

### Setup
1. Update the allowed origins value in the `./src/utils/origins.util.js`
2. Check `AstrDB (DBaaS for Cassandra)` to setup the database.

### AstraDB (DBaaS for Cassandra) setup
1. Create a `AstraDB` database from https://astra.datastax.com/ with a keyspace named `pirate_land`
2. Use the `CQL Console` tab in the AstraDB database that you created to run the CQL queries
    1. Switch to `pirate_land` keyspace using the command `use pirate_land`;
    2. Run all the queries from the file `./queries.cql`.
3. Head to `Connect` tab in the AstraDB database that you created to connect from our backend
    1. Choose `Drivers` under `Select a Method`
    2. Select `Native` in `Type` under `Drivers` and select `Node.js`
    3. Download the `Secure Connect Bundle` (make sure to choose your region where your database resides)
    4. Place the `Secure Connect Bundle` in the project's root directory (ie. in the same directory where `package.json` resides)
    5. Generate `token` for the database (refer `Get an application token 🔑 `from `Quick Start ⚡ `section )
    6. Save the `token` and fill the `ASTRA_CLIENT_ID`, `ASTRA_CLIENT_SECRET` secrets in the `.env` file
    7. `ASTRA_DB_KEYSPACE` will be the name of the keypsace
    
`Note`: Your `.env` file should look something like this.
```
ASTRA_CLIENT_ID=clientId FROM THE token.json YOU DOWNLOADED FROM ASTRA
ASTRA_CLIENT_SECRET=secret FROM THE token.json YOU DOWNLOADED FROM ASTRA
ASTRA_DB_KEYSPACE=pirate_land

JWT_SECRET=SOME RANDOM STRONG PASSWORD
```
### Usage
```
npm install
npm run dev-[mac/win] (in development)
npm start (in production)
```