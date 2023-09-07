const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const port = 3000
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var logID = ""

app.use(bodyParser.urlencoded({
  extended: true
}));

//Static files used to operate the front end of E-Renewal
app.use(express.static(__dirname +'/public'))

//Set default page as the home page
app.get('/', function(req, res)  {
  //Load homepage
  res.sendFile(__dirname + '/public/homepage.html');
})

//GET from getting started page
app.get('/application', (req, res) =>{
  //IF User is Logged in
  if (logID.length > 0) {
    res.sendFile(__dirname + '/public/application-page.html');
  }
  else
    res.send("Error: Please Login First")
})

//Submit Application
app.post('/application-submit', (req, res) =>{
  //First Grab the values from the application form:
  let fname = req.body.first
  let mi = req.body.middle
  let lname = req.body.last
  let dob = req.body.birth
  let sex = req.body.sex
  let pob = req.body.placeOfBirth
  let ssn = req.body.ssn
  let eml = req.body.email.toLowerCase()
  //check to see if email matches account email
  if (eml != logID) {
    res.send("Email does not match account!")
    res.end()
  }
  let ppn = req.body.ppn
  let mline1 = req.body.line1 //Mailing Address
  let mline2 = req.body.line2
  let mcity = req.body.city
  let mstate = req.body.state
  let mzip = req.body.zip
  let prevname1 = req.body.a
  let prevname2 = req.body.b
  let nameReason = req.body.changed
  let placeOfChange = req.body.placeNameChanged
  let dateOfChange = req.body.dateOfChange
  let passportName = req.body.pastNamePass
  let passportNum = req.body.passBookNum
  let issueDate = req.body.issueBook
  let passcardNum = req.body.passCardNum
  let issueCDate = req.body.issueCard
  let height = req.body.height
  let hairColor = req.body.hairColor
  let eyeColor = req.body.eyeColor
  let job = req.body.occupation
  let employer = req.body.employerSchool
  let contact1 = req.body.contact1
  let contact2 = req.body.contact2
  let pstreet = req.body.streetAddr
  let apt = req.body.apartment
  let pcity = req.body.perCity
  let pstate = req.body.perState
  let pzip = req.body.perZip
  let ecName = req.body.ecName
  let ecAddress = req.body.ecAddress
  let ecApartment = req.body.ecApartment
  let ecCity = req.body.ecCity
  let ecState = req.body.ecState
  let ecZip = req.body.ecZip
  let depdate = req.body.departureDate
  let retdate = req.body.returnDate
  let countries = req.body.countries

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("passportdb");
    var myobj = {fname: fname, mi: mi, lname: lname, DOB: dob, sex: sex, POB: pob, SSN: ssn, email: eml, PPN: ppn,
                 mailing_address: {line1: mline1, line2: mline2, city: mcity, state: mstate, zip: mzip},
                 previous_names: {name1: prevname1, name2: prevname2, reason_of_change: nameReason, place_of_change: placeOfChange, date_of_change: dateOfChange},
                 previous_passport: {name: passportName, issue_date: issueDate, passport_num: passportNum},
                 previous_passcard: {name: passportName, issue_date: issueCDate, passcard_num: passcardNum},
                 height: height, hair_color: hairColor, eye_color: eyeColor, occupation: job, employer: employer,
                 emergency_contact: {name: ecName, phone1: contact1, phone2: contact2, address: ecAddress, apt: ecApartment, city: ecCity, state: ecState, zip: ecZip},
                 permenant_address: {street: pstreet, apt: apt, city: pcity, state: pstate, zip: pzip},
                 travel_plans: {departure_date: depdate, return_date: retdate, countries_visited: countries}};
    dbo.collection("applications").find({ email: eml }).toArray(function(err,res0) {
      if (err) throw err;
      //If there is not an existing application, add new one to database and tell user it has been submitted
      if (res0.length == 0) {
        dbo.collection("applications").insertOne(myobj, function(err, res1) {
          if (err) throw err;
          console.log("Application Submitted");
          res.send("Application Submitted")
          db.close();
          res.end();
        });
        //if there already exists an application under this email delete the old one and add the new one
      } else {
        dbo.collection("applications").deleteOne({ email: eml });
        dbo.collection("applications").insertOne(myobj, function(err, res1) {
          if (err) throw err;
          console.log("Application Submitted, previous application deleted");
          res.send("Previous application updated")
          db.close();
          res.end();
        });
      }
    });
  });
})

//Post login requests - login.html
app.post('/login', (req, res) => {
  //Get user
  let username = req.body.username;
  //set input to lowercase for proper checking
  username = username.toLowerCase()
  //Get password
  let password = req.body.password;
  //IF username and password are not empty
  if(username.length && password.length){
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("passportdb");
      var myobj = {email: username, pwd: password};
      dbo.collection("users").find(myobj).toArray(function(err,resm) {
        if (err) throw err;
        //Check to see if username and password match an existing account
        //If not login fails
        //Else login success
        if (resm.length == 0) {
          console.log("Invalid Email or Password");
          res.send("Invalid Email or Password");
          res.end();
          db.close();
        } else {
          logID = username
          res.send("Welcome back " + username)
          res.end();
          console.log(logID)
          console.log("Login Success")
        }
      });
    });
  }
  //ELSE
  else{
    //Send response "Enter both a username and pass word"
    res.send('Enter Both a Username and Password!');
    //End response
    res.end();
  }//END IF
})

//Post create user requests - create-account-page.html
app.post('/create', (req, res) => {
  //Grab items from create account form
  let firstn = req.body.fname
  let mi = req.body.Mi
  let lastn = req.body.lname
  let dob = req.body.dob
  let eml = req.body.email
  let pwd = req.body.pwd
  let ssn = req.body.SSN
  let addy = req.body.address
  let city = req.body.city
  let state = req.body.state
  //make sure to set email to lowercase for proper checking 
  eml = eml.toLowerCase()
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("passportdb");
    var myobj = { fname: firstn, mi: mi, lname: lastn, email: eml, pwd: pwd,
                 dob: dob, SSN: ssn,
                 address: addy, city: city, state: state};
    dbo.collection("users").find({ email: eml }).toArray(function(err,res0) {
      if (err) throw err;
      //Check to see if email already exists in database
      //If not then register user in the databse
      //If yes then tell user to login with email, or create an account with a different email
      if (res0.length == 0) {
        dbo.collection("users").insertOne(myobj, function(err, res1) {
          if (err) throw err;
          console.log("Welcome to E-Renewal " + firstn);
          if (mi.length > 0)
            res.send("Welcome to E-Renewal " + firstn + " " + mi + ". " + lastn + ". \nYou have registered with the email:\n" + eml + "\n and with the address:\n" + addy + ", " + city + ", " + state + ".");
          else
            res.send("Welcome to E-Renewal " + firstn + " " + lastn + ". \nYou have registered with the email:\n" + eml + "\n and with the address:\n" + addy + ", " + city + ", " + state + ".");
          db.close();
          res.end();
        });
      } else {
        console.log("Username already in use");
        res.send("The email " + eml + " is already in use, \nplease login with that email or create a new account with a different one.")
        db.close();
      }
    });
  });
})

//Listen to the port 3000
app.listen(port, () => {
  console.log(`E-Renewal listening on port ${port}`)
})
