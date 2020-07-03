# medal math
made by claudia and luke

## explanation
medal math is a school project where we had to create a math site for a pre-school, it is focussing to teach small kids how to do basic math

## installation
to run the server locally make a new empty folder for the project, then do the following commands in cmd in that folder:

clone the git repo
```bat
git clone https://github.com/justlucdewit/medalMath
```

go inside the repo
```bat
cd medalMath
```

install dependancies
```bat
npm install
```

launch live server
```bat
npm run dev
```


### WARNING: you will need a .env file to run the server, this .env file is not provided in this repo as it contains sensative credentials of our database, make sure the .env file contains keys like these:
  ```dotenv
  masterKey=[the master key]
  PORT=[the port to run the server]
  DATABASE_URL=[the url to the postgresql database]
  ```
